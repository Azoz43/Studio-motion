import type { MediaAsset, MotionProject } from '../core/model';
import { evaluateLayerAtTime } from '../core/animation';
import { clamp } from '../core/timeline';
import {
  DEFAULT_MAX_MEDIA_BYTES,
  validateSafeUri,
  verifyMediaMagicBytes,
} from '../security/validation';

export type AudioMixTrack = {
  layerId: string;
  layerName: string;
  kind: 'video' | 'audio';
  sourceUri: string;
  startMs: number;
  durationMs: number;
  inPointMs: number;
  outPointMs: number;
  gain: number;
  gainEnvelope: Array<{ timeMs: number; gain: number }>;
};

export type AudioSynchronizationPlan = {
  projectDurationMs: number;
  sampleRate: 44100 | 48000;
  channels: 1 | 2;
  masterVolume: number;
  masterMuted: boolean;
  tracks: AudioMixTrack[];
};

export function computeAudioMixPlan(project: MotionProject): AudioSynchronizationPlan {
  const sampleRate = project.audioSettings?.sampleRate ?? 44100;
  const channels = project.audioSettings?.channels ?? 2;
  const masterMuted = project.audioSettings?.muted ?? false;
  const masterVolume = clamp(project.audioSettings?.masterVolume ?? 1, 0, 2);
  const assets = project.mediaAssets ?? [];

  const tracks: AudioMixTrack[] = [];

  for (const layer of project.layers) {
    if (!layer.visible || layer.muted || masterMuted) continue;
    if (layer.kind !== 'audio' && layer.kind !== 'video') continue;

    const asset = layer.mediaId
      ? assets.find((a) => a.id === layer.mediaId)
      : layer.sourceUri
      ? assets.find((a) => a.uri === layer.sourceUri)
      : undefined;

    if (asset && (asset.status !== 'ready' || asset.hasAudio === false)) {
      continue;
    }

    const sourceUri = asset?.uri ?? layer.sourceUri;
    if (!sourceUri) continue;

    const timelineStartMs = clamp(layer.startMs, 0, project.durationMs);
    if (timelineStartMs >= project.durationMs) continue;

    const maxTimelineDuration = project.durationMs - timelineStartMs;
    const inPointMs = Math.max(0, layer.inPointMs ?? 0);
    const availableSourceDuration =
      asset?.durationMs && asset.durationMs > inPointMs
        ? asset.durationMs - inPointMs
        : layer.durationMs;

    const effectiveDurationMs = clamp(
      Math.min(layer.durationMs, availableSourceDuration, maxTimelineDuration),
      0,
      maxTimelineDuration
    );
    if (effectiveDurationMs <= 0) continue;

    const outPointMs = inPointMs + effectiveDurationMs;

    const gainEnvelope: Array<{ timeMs: number; gain: number }> = [];
    const stepMs = Math.max(50, Math.min(250, Math.floor(effectiveDurationMs / 10) || 50));
    let sumGain = 0;
    let count = 0;
    for (let t = 0; t <= effectiveDurationMs; t += stepMs) {
      const state = evaluateLayerAtTime(layer, timelineStartMs + t);
      const g = clamp(state.volume * masterVolume, 0, 4);
      gainEnvelope.push({ timeMs: t, gain: g });
      sumGain += g;
      count++;
    }
    const avgGain = count > 0 ? sumGain / count : clamp((layer.volume ?? 1) * masterVolume, 0, 4);
    if (avgGain <= 0 && gainEnvelope.every((e) => e.gain <= 0)) continue;

    tracks.push({
      layerId: layer.id,
      layerName: layer.name,
      kind: layer.kind,
      sourceUri,
      startMs: timelineStartMs,
      durationMs: effectiveDurationMs,
      inPointMs,
      outPointMs,
      gain: Number(avgGain.toFixed(4)),
      gainEnvelope,
    });
  }

  return {
    projectDurationMs: project.durationMs,
    sampleRate,
    channels,
    masterVolume,
    masterMuted,
    tracks,
  };
}

export function parsePngDimensions(header: Uint8Array): { width: number; height: number } | null {
  if (header.byteLength < 24) return null;
  const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  if (width > 0 && height > 0 && width <= 16384 && height <= 16384) {
    return { width, height };
  }
  return null;
}

export function parseWavMetadata(header: Uint8Array, totalFileBytes: number): {
  sampleRate: number;
  channels: number;
  durationMs: number;
} | null {
  if (header.byteLength < 44) return null;
  const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  const channels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const byteRate = view.getUint32(28, true);
  if (byteRate <= 0 || sampleRate <= 0) return null;
  const payloadBytes = Math.max(0, totalFileBytes - 44);
  const durationMs = Math.max(100, Math.round((payloadBytes / byteRate) * 1000));
  return { sampleRate, channels, durationMs };
}

export type ImportMediaInput = {
  uri: string;
  name?: string;
  headerBytes: Uint8Array;
  sizeBytes: number;
  probedMetadata?: {
    durationMs?: number;
    width?: number;
    height?: number;
    fps?: number;
    hasAudio?: boolean;
  };
  maxBytes?: number;
};

export function validateAndCreateMediaAsset(input: ImportMediaInput): MediaAsset {
  const uriCheck = validateSafeUri(input.uri);
  if (!uriCheck.safe) {
    throw new Error(`Invalid media path: ${uriCheck.reason}`);
  }

  const magic = verifyMediaMagicBytes(
    input.headerBytes,
    input.name ?? input.uri,
    input.sizeBytes,
    input.maxBytes ?? DEFAULT_MAX_MEDIA_BYTES
  );

  if (!magic.valid || !magic.kind || !magic.mimeType) {
    throw new Error(magic.reason ?? 'Unsupported or corrupted media file.');
  }

  let width = input.probedMetadata?.width;
  let height = input.probedMetadata?.height;
  let durationMs = input.probedMetadata?.durationMs;

  if (magic.extension === 'png' && (!width || !height)) {
    const dims = parsePngDimensions(input.headerBytes);
    if (!dims) {
      throw new Error('Corrupted PNG header: invalid IHDR dimensions.');
    }
    width = dims.width;
    height = dims.height;
  }

  if (magic.extension === 'wav' && !durationMs) {
    const wav = parseWavMetadata(input.headerBytes, input.sizeBytes);
    if (!wav) {
      throw new Error('Corrupted WAV header: invalid sample rate or byte rate.');
    }
    durationMs = wav.durationMs;
  }

  const fileName =
    input.name ??
    input.uri.split('/').pop() ??
    `${magic.kind}.${magic.extension ?? 'bin'}`;

  return {
    id: `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: fileName,
    kind: magic.kind,
    uri: input.uri,
    mimeType: magic.mimeType,
    sizeBytes: input.sizeBytes,
    width: magic.kind === 'image' || magic.kind === 'video' ? width ?? 640 : undefined,
    height: magic.kind === 'image' || magic.kind === 'video' ? height ?? 360 : undefined,
    durationMs:
      magic.kind === 'video' || magic.kind === 'audio' ? durationMs ?? 3000 : undefined,
    fps: magic.kind === 'video' ? input.probedMetadata?.fps ?? 30 : undefined,
    hasAudio:
      magic.kind === 'audio'
        ? true
        : magic.kind === 'video'
        ? input.probedMetadata?.hasAudio ?? true
        : false,
    status: 'ready',
  };
}
