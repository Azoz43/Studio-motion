import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn, spawnSync } from 'child_process';
import type { MediaAsset, MotionProject } from '../core/model';
import { validateProject } from '../core/project';
import { evaluateSceneAtTime } from '../core/preview';
import { clamp } from '../core/timeline';
import {
  computeAudioMixPlan,
  validateAndCreateMediaAsset,
} from './mediaPipeline';
import {
  renderSceneToRgba,
  type DecodedRgbaImage,
} from './softwareRasterizer';
import { sanitizeLogMessage, validateSafeUri } from '../security/validation';

export type ExportProgressEvent = {
  percent: number;
  currentFrame: number;
  totalFrames: number;
  stage: 'validating' | 'decoding_media' | 'rendering_frames' | 'muxing_audio' | 'verifying' | 'completed';
};

export type ExportOptions = {
  outputPath: string;
  width?: number;
  height?: number;
  fps?: number;
  onProgress?: (event: ExportProgressEvent) => void;
  signal?: AbortSignal;
};

export type VerifiedMp4Metadata = {
  valid: boolean;
  outputPath: string;
  sizeBytes: number;
  formatName: string;
  videoCodec: string;
  audioCodec?: string;
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  nbFrames: number;
  hasAudioStream: boolean;
};

export class TempFileManager {
  private createdDirs: string[] = [];

  createTempDir(prefix = 'motion-studio-'): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    this.createdDirs.push(dir);
    return dir;
  }

  cleanupAll(): void {
    for (const dir of this.createdDirs) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    this.createdDirs = [];
  }
}

export function importMediaFileFromDisk(filePath: string, maxBytes?: number): MediaAsset {
  const uriCheck = validateSafeUri(filePath);
  if (!uriCheck.safe) {
    throw new Error(`Security error: ${uriCheck.reason}`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Media file does not exist: ${sanitizeLogMessage(filePath)}`);
  }
  const stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size <= 0) {
    throw new Error(`Media path is empty or not a regular file: ${sanitizeLogMessage(filePath)}`);
  }

  const fd = fs.openSync(filePath, 'r');
  const headerLen = Math.min(stat.size, 64);
  const headerBuf = Buffer.alloc(headerLen);
  try {
    fs.readSync(fd, headerBuf, 0, headerLen, 0);
  } finally {
    fs.closeSync(fd);
  }

  let probedMetadata: {
    durationMs?: number;
    width?: number;
    height?: number;
    fps?: number;
    hasAudio?: boolean;
  } = {};

  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', filePath],
    { encoding: 'utf8', timeout: 10000 }
  );

  if (probe.status === 0 && probe.stdout) {
    try {
      const info = JSON.parse(probe.stdout);
      const streams: any[] = Array.isArray(info.streams) ? info.streams : [];
      const vStream = streams.find((s) => s.codec_type === 'video');
      const aStream = streams.find((s) => s.codec_type === 'audio');
      const durSec = parseFloat(info.format?.duration ?? vStream?.duration ?? aStream?.duration ?? '0');
      if (Number.isFinite(durSec) && durSec > 0) {
        probedMetadata.durationMs = Math.round(durSec * 1000);
      }
      if (vStream) {
        if (typeof vStream.width === 'number') probedMetadata.width = vStream.width;
        if (typeof vStream.height === 'number') probedMetadata.height = vStream.height;
        if (typeof vStream.r_frame_rate === 'string' && vStream.r_frame_rate.includes('/')) {
          const [num, den] = vStream.r_frame_rate.split('/').map(Number);
          if (num > 0 && den > 0) probedMetadata.fps = Math.round(num / den);
        }
      }
      probedMetadata.hasAudio = Boolean(aStream);
    } catch {
      // Fallback to header parser
    }
  }

  const asset = validateAndCreateMediaAsset({
    uri: filePath,
    name: path.basename(filePath),
    headerBytes: new Uint8Array(headerBuf.buffer, headerBuf.byteOffset, headerBuf.byteLength),
    sizeBytes: stat.size,
    probedMetadata,
    maxBytes,
  });

  if ((asset.kind === 'video' || asset.kind === 'audio') && probe.status !== 0) {
    throw new Error(`Corrupted ${asset.kind} stream structure: media decoder could not read streams.`);
  }

  return asset;
}

export function decodeMediaFrameToRgba(
  uri: string,
  targetW: number,
  targetH: number,
  sourceTimeMs = 0
): DecodedRgbaImage | null {
  if (!fs.existsSync(uri)) return null;
  const w = Math.max(2, Math.round(targetW));
  const h = Math.max(2, Math.round(targetH));
  const args: string[] = ['-v', 'error'];
  if (sourceTimeMs > 0) {
    args.push('-ss', (sourceTimeMs / 1000).toFixed(3));
  }
  args.push(
    '-i',
    uri,
    '-frames:v',
    '1',
    '-vf',
    `scale=${w}:${h}`,
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    'pipe:1'
  );
  const res = spawnSync('ffmpeg', args, {
    maxBuffer: w * h * 4 + 1024 * 1024,
    timeout: 15000,
  });
  if (res.status !== 0 || !res.stdout || res.stdout.byteLength < w * h * 4) {
    return null;
  }
  return {
    width: w,
    height: h,
    data: new Uint8Array(res.stdout.buffer, res.stdout.byteOffset, w * h * 4),
  };
}

export function verifyExportedMp4(mp4Path: string): VerifiedMp4Metadata {
  if (!fs.existsSync(mp4Path)) {
    throw new Error(`Exported MP4 file not found at ${sanitizeLogMessage(mp4Path)}`);
  }
  const stat = fs.statSync(mp4Path);
  if (stat.size < 256) {
    throw new Error(`Exported MP4 file is too small (${stat.size} bytes) to be a valid container.`);
  }

  const probe = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=format_name,duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_frames',
      '-of',
      'json',
      mp4Path,
    ],
    { encoding: 'utf8', timeout: 10000 }
  );

  if (probe.status !== 0 || !probe.stdout) {
    throw new Error(`ffprobe verification failed: ${sanitizeLogMessage(probe.stderr || 'unknown error')}`);
  }

  const parsed = JSON.parse(probe.stdout);
  const streams: any[] = Array.isArray(parsed.streams) ? parsed.streams : [];
  const videoStream = streams.find((s) => s.codec_type === 'video');
  const audioStream = streams.find((s) => s.codec_type === 'audio');

  if (!videoStream) {
    throw new Error('Exported MP4 has no video stream.');
  }

  let fps = 30;
  if (typeof videoStream.r_frame_rate === 'string' && videoStream.r_frame_rate.includes('/')) {
    const [n, d] = videoStream.r_frame_rate.split('/').map(Number);
    if (n > 0 && d > 0) fps = Math.round(n / d);
  }

  const durationSec = parseFloat(parsed.format?.duration ?? videoStream.duration ?? '0');
  const nbFrames = parseInt(videoStream.nb_frames ?? '0', 10) || Math.round(durationSec * fps);

  return {
    valid: true,
    outputPath: mp4Path,
    sizeBytes: stat.size,
    formatName: String(parsed.format?.format_name ?? 'mp4'),
    videoCodec: String(videoStream.codec_name ?? ''),
    audioCodec: audioStream ? String(audioStream.codec_name ?? '') : undefined,
    width: Number(videoStream.width ?? 0),
    height: Number(videoStream.height ?? 0),
    fps,
    durationSec,
    nbFrames,
    hasAudioStream: Boolean(audioStream),
  };
}

export async function exportProjectToMp4(
  rawProject: MotionProject,
  options: ExportOptions
): Promise<VerifiedMp4Metadata> {
  const tempManager = new TempFileManager();
  try {
    if (options.signal?.aborted) {
      throw new Error('Export cancelled before start.');
    }

    const project = validateProject(rawProject);
    const outWidth = Math.max(16, Math.round((options.width ?? project.exportSettings?.width ?? project.width) / 2) * 2);
    const outHeight = Math.max(16, Math.round((options.height ?? project.exportSettings?.height ?? project.height) / 2) * 2);
    const fps = clamp(Math.round(options.fps ?? project.exportSettings?.fps ?? project.fps), 1, 120);
    const durationSec = Math.max(0.1, project.durationMs / 1000);
    const totalFrames = Math.max(1, Math.round(durationSec * fps));

    options.onProgress?.({
      percent: 5,
      currentFrame: 0,
      totalFrames,
      stage: 'validating',
    });

    const scaleX = outWidth / project.width;
    const scaleY = outHeight / project.height;
    const uniformScale = Math.min(scaleX, scaleY);

    const scaledProject: MotionProject = {
      ...project,
      width: outWidth,
      height: outHeight,
      fps,
      layers: project.layers.map((l) => ({
        ...l,
        x: l.x * scaleX,
        y: l.y * scaleY,
        width: l.width ? Math.round(l.width * uniformScale) : undefined,
        height: l.height ? Math.round(l.height * uniformScale) : undefined,
        fontSize: l.fontSize ? Math.round(l.fontSize * uniformScale) : undefined,
        keyframes: l.keyframes.map((kf) => ({
          ...kf,
          value:
            kf.property === 'x'
              ? kf.value * scaleX
              : kf.property === 'y'
              ? kf.value * scaleY
              : kf.value,
        })),
      })),
    };

    options.onProgress?.({
      percent: 10,
      currentFrame: 0,
      totalFrames,
      stage: 'decoding_media',
    });

    const staticDecodedMap = new Map<string, DecodedRgbaImage>();
    for (const layer of scaledProject.layers) {
      if (layer.kind === 'image') {
        const asset = (scaledProject.mediaAssets ?? []).find((a) => a.id === layer.mediaId);
        const uri = asset?.uri ?? layer.sourceUri;
        const key = asset?.id ?? uri ?? layer.id;
        if (uri && !staticDecodedMap.has(key)) {
          const decoded = decodeMediaFrameToRgba(
            uri,
            layer.width ?? asset?.width ?? 320,
            layer.height ?? asset?.height ?? 240,
            0
          );
          if (decoded) {
            staticDecodedMap.set(key, decoded);
          }
        }
      }
    }

    const audioPlan = computeAudioMixPlan(scaledProject);
    const validAudioTracks = audioPlan.tracks.filter((t) => fs.existsSync(t.sourceUri));

    const outputDir = path.dirname(options.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const tempDir = tempManager.createTempDir('motion-studio-export-');
    const tempMp4Path = path.join(tempDir, 'staging_output.mp4');

    const ffArgs: string[] = [
      '-y',
      '-v',
      'error',
      '-f',
      'rawvideo',
      '-pix_fmt',
      'rgba',
      '-s',
      `${outWidth}x${outHeight}`,
      '-r',
      String(fps),
      '-i',
      'pipe:0',
    ];

    if (validAudioTracks.length === 0) {
      ffArgs.push(
        '-f',
        'lavfi',
        '-i',
        `anullsrc=channel_layout=stereo:sample_rate=${audioPlan.sampleRate}`
      );
      ffArgs.push(
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'libx264',
        '-preset',
        project.exportSettings?.preset ?? 'ultrafast',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        `${project.exportSettings?.audioBitrateKbps ?? 128}k`,
        '-t',
        durationSec.toFixed(3),
        '-movflags',
        '+faststart',
        tempMp4Path
      );
    } else {
      for (const track of validAudioTracks) {
        ffArgs.push('-i', track.sourceUri);
      }
      const filterParts: string[] = [];
      const mixLabels: string[] = [];
      validAudioTracks.forEach((track, idx) => {
        const inputIdx = idx + 1;
        const inSec = (track.inPointMs / 1000).toFixed(3);
        const durSec = (track.durationMs / 1000).toFixed(3);
        const delayMs = Math.round(track.startMs);
        const label = `a${idx}`;
        filterParts.push(
          `[${inputIdx}:a]atrim=start=${inSec}:duration=${durSec},asetpts=PTS-STARTPTS,volume=${track.gain.toFixed(3)},adelay=${delayMs}|${delayMs}[${label}]`
        );
        mixLabels.push(`[${label}]`);
      });
      const bedIdx = validAudioTracks.length + 1;
      ffArgs.push(
        '-f',
        'lavfi',
        '-t',
        durationSec.toFixed(3),
        '-i',
        `anullsrc=channel_layout=stereo:sample_rate=${audioPlan.sampleRate}`
      );
      mixLabels.push(`[${bedIdx}:a]`);
      filterParts.push(
        `${mixLabels.join('')}amix=inputs=${mixLabels.length}:duration=longest:dropout_transition=0[aout]`
      );

      ffArgs.push(
        '-filter_complex',
        filterParts.join(';'),
        '-map',
        '0:v:0',
        '-map',
        '[aout]',
        '-c:v',
        'libx264',
        '-preset',
        project.exportSettings?.preset ?? 'ultrafast',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        `${project.exportSettings?.audioBitrateKbps ?? 128}k`,
        '-t',
        durationSec.toFixed(3),
        '-movflags',
        '+faststart',
        tempMp4Path
      );
    }

    await new Promise<void>((resolve, reject) => {
      const proc = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stderrText = '';
      proc.stderr.on('data', (chunk) => {
        stderrText += String(chunk);
      });

      const onAbort = () => {
        proc.kill('SIGKILL');
        reject(new Error('Export cancelled by user.'));
      };
      if (options.signal) {
        options.signal.addEventListener('abort', onAbort, { once: true });
      }

      proc.on('error', (err) => {
        if (options.signal) options.signal.removeEventListener('abort', onAbort);
        reject(err);
      });

      proc.on('close', (code) => {
        if (options.signal) options.signal.removeEventListener('abort', onAbort);
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg encoding failed (exit ${code}): ${sanitizeLogMessage(stderrText)}`));
      });

      const frameBuffer = new Uint8Array(outWidth * outHeight * 4);
      let currentFrame = 0;

      const writeNextFrame = () => {
        while (currentFrame < totalFrames) {
          if (options.signal?.aborted) {
            proc.kill('SIGKILL');
            return;
          }
          const timeMs = (currentFrame / fps) * 1000;
          const scene = evaluateSceneAtTime(scaledProject, timeMs);

          const frameMediaMap = new Map<string, DecodedRgbaImage>(staticDecodedMap);
          for (const node of scene.visualNodes) {
            if (node.kind === 'video' && node.media?.hasSource && node.media.uri) {
              const key = node.media.asset?.id ?? node.media.uri ?? node.layerId;
              const decodedVidFrame = decodeMediaFrameToRgba(
                node.media.uri,
                node.width,
                node.height,
                node.state.sourceTimeMs
              );
              if (decodedVidFrame) {
                frameMediaMap.set(key, decodedVidFrame);
              }
            }
          }

          renderSceneToRgba(scene, frameMediaMap, frameBuffer);
          currentFrame++;

          const pct = 15 + Math.round((currentFrame / totalFrames) * 75);
          options.onProgress?.({
            percent: pct,
            currentFrame,
            totalFrames,
            stage: 'rendering_frames',
          });

          const canContinue = proc.stdin.write(Buffer.from(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength));
          if (!canContinue) {
            proc.stdin.once('drain', writeNextFrame);
            return;
          }
        }
        options.onProgress?.({
          percent: 92,
          currentFrame: totalFrames,
          totalFrames,
          stage: 'muxing_audio',
        });
        proc.stdin.end();
      };

      writeNextFrame();
    });

    options.onProgress?.({
      percent: 96,
      currentFrame: totalFrames,
      totalFrames,
      stage: 'verifying',
    });

    const verified = verifyExportedMp4(tempMp4Path);
    fs.copyFileSync(tempMp4Path, options.outputPath);

    options.onProgress?.({
      percent: 100,
      currentFrame: totalFrames,
      totalFrames,
      stage: 'completed',
    });

    return {
      ...verified,
      outputPath: options.outputPath,
    };
  } finally {
    tempManager.cleanupAll();
  }
}
