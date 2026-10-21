import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { makeLayer, makeProject, migrateProject, serializeProject, validateProject } from '../src/core/project';
import {
  addLayer,
  addMediaLayer,
  addPropertyKeyframe,
  duplicateLayer,
  moveLayerOrder,
  movePlayhead,
  removeLayer,
  reorderLayer,
  splitLayerAtTime,
  stepFrame,
  trimLayer,
} from '../src/core/timeline';
import { evaluateLayerAtTime, interpolateKeyframes } from '../src/core/animation';
import { evaluateSceneAtTime, PlaybackController } from '../src/core/preview';
import { InMemoryStorageAdapter, ProjectStorageManager } from '../src/storage/projectStorage';
import { computeAudioMixPlan } from '../src/media/mediaPipeline';
import {
  decodeMediaFrameToRgba,
  exportProjectToMp4,
  importMediaFileFromDisk,
  TempFileManager,
  verifyExportedMp4,
} from '../src/media/exporter';

type TestCaseResult = {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL';
  evidence: string;
  durationMs: number;
};

const results: TestCaseResult[] = [];

async function runTest(id: string, name: string, fn: () => Promise<string> | string): Promise<void> {
  const started = Date.now();
  try {
    const evidence = await fn();
    const elapsed = Date.now() - started;
    results.push({ id, name, status: 'PASS', evidence, durationMs: elapsed });
    console.log(`[PASS] ${id} - ${name} (${elapsed}ms)\n       Evidence: ${evidence}`);
  } catch (err) {
    const elapsed = Date.now() - started;
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    results.push({ id, name, status: 'FAIL', evidence: msg, durationMs: elapsed });
    console.error(`[FAIL] ${id} - ${name} (${elapsed}ms)\n       Reason: ${msg}`);
  }
}

function generateTestMediaFixtures(dir: string): {
  imagePath: string;
  videoPath: string;
  audioPath: string;
  corruptPath: string;
} {
  fs.mkdirSync(dir, { recursive: true });
  const imagePath = path.join(dir, 'fixture_badge.png');
  const videoPath = path.join(dir, 'fixture_clip.mp4');
  const audioPath = path.join(dir, 'fixture_tone.wav');
  const corruptPath = path.join(dir, 'corrupt_file.mp4');

  spawnSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'color=c=#00E5A3:s=120x80:d=1',
    '-frames:v',
    '1',
    imagePath,
  ]);

  spawnSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'testsrc=size=320x240:rate=30:duration=2.5',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=440:sample_rate=44100:duration=2.5',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    videoPath,
  ]);

  spawnSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=528:sample_rate=44100:duration=3.0',
    audioPath,
  ]);

  fs.writeFileSync(corruptPath, Buffer.from('NOT_A_VALID_MP4_HEADER_DATA_0000'));

  return { imagePath, videoPath, audioPath, corruptPath };
}

async function main() {
  const tempMgr = new TempFileManager();
  const fixtureDir = tempMgr.createTempDir('motion-studio-fixtures-');
  const fixtures = generateTestMediaFixtures(fixtureDir);

  // UT-01: Layer position & transform calculation at specific time t
  await runTest('UT-01', 'حساب موضع طبقة وتحويلاتها عند زمن معين (Layer position at time t)', () => {
    let layer = makeLayer('shape', 1, { startMs: 500, durationMs: 2000, x: -100, y: 50, scale: 1, rotation: 0 });
    layer = addPropertyKeyframe(layer, 0, 'x', -100, 'linear');
    layer = addPropertyKeyframe(layer, 2000, 'x', 300, 'linear');
    layer = addPropertyKeyframe(layer, 0, 'y', 50, 'linear');
    layer = addPropertyKeyframe(layer, 2000, 'y', -150, 'linear');
    layer = addPropertyKeyframe(layer, 0, 'rotation', 0, 'linear');
    layer = addPropertyKeyframe(layer, 2000, 'rotation', 180, 'linear');

    const state = evaluateLayerAtTime(layer, 1500);
    assert.strictEqual(state.active, true);
    assert.strictEqual(state.localTimeMs, 1000);
    assert.strictEqual(state.x, 100);
    assert.strictEqual(state.y, -50);
    assert.strictEqual(state.rotation, 90);
    return `At projectTime=1500ms (local=1000ms): x=${state.x}, y=${state.y}, rotation=${state.rotation}deg, active=${state.active}`;
  });

  // UT-02: Interpolation between two keyframes (linear, easeIn, easeOut, easeInOut, cubicBezier, step)
  await runTest('UT-02', 'حساب الاستيفاء بين إطارين مفتاحيين (Linear, Ease, CubicBezier, Step)', () => {
    const kfLinear = [
      { id: '1', timeMs: 0, value: 0, easing: 'linear' as const },
      { id: '2', timeMs: 1000, value: 100, easing: 'linear' as const },
    ];
    const kfEaseIn = [
      { id: '1', timeMs: 0, value: 0, easing: 'easeIn' as const },
      { id: '2', timeMs: 1000, value: 100, easing: 'linear' as const },
    ];
    const kfEaseOut = [
      { id: '1', timeMs: 0, value: 0, easing: 'easeOut' as const },
      { id: '2', timeMs: 1000, value: 100, easing: 'linear' as const },
    ];
    const kfBezier = [
      {
        id: '1',
        timeMs: 0,
        value: 0,
        easing: 'cubicBezier' as const,
        controlPoints: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
      },
      { id: '2', timeMs: 1000, value: 100, easing: 'linear' as const },
    ];
    const kfStep = [
      { id: '1', timeMs: 0, value: 10, easing: 'step' as const },
      { id: '2', timeMs: 1000, value: 90, easing: 'linear' as const },
    ];

    const vLin = interpolateKeyframes(kfLinear, 500, 0);
    const vIn = interpolateKeyframes(kfEaseIn, 500, 0);
    const vOut = interpolateKeyframes(kfEaseOut, 500, 0);
    const vBez = interpolateKeyframes(kfBezier, 500, 0);
    const vStepMid = interpolateKeyframes(kfStep, 999, 0);
    const vStepEnd = interpolateKeyframes(kfStep, 1000, 0);

    assert.strictEqual(vLin, 50);
    assert.strictEqual(vIn, 25);
    assert.strictEqual(vOut, 75);
    assert.ok(vBez > 60 && vBez < 90);
    assert.strictEqual(vStepMid, 10);
    assert.strictEqual(vStepEnd, 90);
    return `t=500ms -> linear=${vLin}, easeIn=${vIn}, easeOut=${vOut}, cubicBezier=${vBez.toFixed(2)}, step(999ms)=${vStepMid}, step(1000ms)=${vStepEnd}`;
  });

  // UT-03: Out-of-bounds time values
  await runTest('UT-03', 'التعامل مع القيم الزمنية خارج المدة (Out-of-bounds time handling)', () => {
    let layer = makeLayer('text', 1, { startMs: 1000, durationMs: 2000, opacity: 1 });
    layer = addPropertyKeyframe(layer, 500, 'x', -50, 'linear');
    layer = addPropertyKeyframe(layer, 1500, 'x', 150, 'linear');

    const beforeLayer = evaluateLayerAtTime(layer, 500);
    const beforeFirstKf = evaluateLayerAtTime(layer, 1200);
    const afterLastKf = evaluateLayerAtTime(layer, 2800);
    const afterLayer = evaluateLayerAtTime(layer, 3500);

    assert.strictEqual(beforeLayer.active, false);
    assert.strictEqual(beforeLayer.opacity, 0);
    assert.strictEqual(beforeFirstKf.active, true);
    assert.strictEqual(beforeFirstKf.x, -50);
    assert.strictEqual(afterLastKf.active, true);
    assert.strictEqual(afterLastKf.x, 150);
    assert.strictEqual(afterLayer.active, false);
    assert.strictEqual(afterLayer.opacity, 0);

    const p = makeProject({ durationMs: 4000 });
    assert.strictEqual(movePlayhead(p, -500).currentTimeMs, 0);
    assert.strictEqual(movePlayhead(p, 99999).currentTimeMs, 4000);
    return `Inactive @500ms (opacity=${beforeLayer.opacity}), clamped pre-keyframe @1200ms (x=${beforeFirstKf.x}), clamped post-keyframe @2800ms (x=${afterLastKf.x}), inactive @3500ms (opacity=${afterLayer.opacity})`;
  });

  // UT-04: Layer ordering, trimming, splitting, and frame stepping
  await runTest('UT-04', 'ترتيب الطبقات والقص والتقسيم والتقدم الإطاري (Layer ordering, trimming, splitting & frame step)', () => {
    let proj = makeProject({ fps: 25, layers: [] });
    proj = addLayer(proj, 'text', { name: 'Top Text' });
    proj = addLayer(proj, 'shape', { name: 'Mid Shape' });
    proj = addLayer(proj, 'image', { name: 'Back Image' });

    const scene1 = evaluateSceneAtTime(proj, 0);
    assert.deepStrictEqual(
      scene1.visualNodes.map((n) => n.name),
      ['Back Image', 'Mid Shape', 'Top Text']
    );

    const backId = proj.layers[2].id;
    proj = moveLayerOrder(proj, backId, 'front');
    assert.strictEqual(proj.layers[0].name, 'Back Image');

    proj = splitLayerAtTime(proj, backId, 2000);
    assert.strictEqual(proj.layers.length, 4);
    assert.strictEqual(proj.layers[0].durationMs, 2000);
    assert.strictEqual(proj.layers[1].startMs, 2000);
    assert.strictEqual(proj.layers[1].durationMs, 3000);

    const ctrl = new PlaybackController();
    const stepped = ctrl.step(proj, 3); // 3 frames @ 25fps = 120ms
    assert.strictEqual(stepped.currentTimeMs, 120);

    return `Painter order verified; moved layer to front; split 5000ms layer into 2000ms + 3000ms; frame step +3f @25fps -> ${stepped.currentTimeMs}ms`;
  });

  // UT-05: Save, reload, backup recovery, and v1->v2 schema migration
  await runTest('UT-05', 'الحفظ الذري وإعادة التحميل وترقية المخطط (Atomic save, backup recovery & v1->v2 migration)', async () => {
    const adapter = new InMemoryStorageAdapter();
    const storage = new ProjectStorageManager(adapter);

    const legacyV1 = {
      schemaVersion: 1,
      id: 'legacy-proj-1',
      name: 'Legacy v1 Project',
      width: 1080,
      height: 1920,
      fps: 30,
      durationMs: 4000,
      currentTimeMs: 1200,
      layers: [
        {
          id: 'l1',
          name: 'Title',
          kind: 'text',
          visible: true,
          locked: false,
          startMs: 0,
          durationMs: 4000,
          opacity: 0.9,
          x: 15,
          y: -25,
          scale: 1.2,
          keyframes: [{ id: 'opacity-500', timeMs: 500, value: 0.5, easing: 'easeInOut' }],
          effects: [],
        },
      ],
    };

    const migrated = migrateProject(legacyV1);
    assert.strictEqual(migrated.schemaVersion, 2);
    assert.strictEqual(migrated.layers[0].keyframes[0].property, 'opacity');

    await storage.saveProject(migrated);
    const updated = { ...migrated, name: 'Updated v2 Project' };
    const saveRes = await storage.saveProject(updated);
    assert.strictEqual(saveRes.backedUpPrevious, true);

    const reopened = await storage.loadLastOpenedProject();
    assert.ok(reopened);
    assert.strictEqual(reopened.project.name, 'Updated v2 Project');

    await adapter.setItem(`project:${migrated.id}`, '{corrupted_json_syntax');
    const recovered = await storage.loadProject(migrated.id);
    assert.strictEqual(recovered.recoveredFromBackup, true);
    assert.strictEqual(recovered.project.name, 'Legacy v1 Project');

    return `v1->v2 migrated losslessly; atomic save & reopen succeeded; corrupted primary recovered automatically from .bak (${recovered.project.name})`;
  });

  // UT-06: Invalid project import rejection
  await runTest('UT-06', 'رفض استيراد المشاريع غير الصالحة أو الخبيثة (Invalid project import rejection)', () => {
    const invalidCases: Array<{ label: string; payload: unknown }> = [
      { label: 'null payload', payload: null },
      { label: 'unsupported schemaVersion 99', payload: { schemaVersion: 99, width: 1080, height: 1920, layers: [] } },
      { label: 'negative width', payload: { schemaVersion: 2, width: -100, height: 1920, layers: [] } },
      { label: 'NaN height', payload: { schemaVersion: 2, width: 1080, height: Number.NaN, layers: [] } },
      {
        label: 'invalid layer kind',
        payload: {
          schemaVersion: 2,
          width: 1080,
          height: 1920,
          layers: [{ id: '1', name: 'Bad', kind: 'malicious_exe', startMs: 0, durationMs: 1000 }],
        },
      },
      {
        label: 'exceeds 200 layers limit',
        payload: {
          schemaVersion: 2,
          width: 1080,
          height: 1920,
          layers: Array.from({ length: 205 }, (_, i) => makeLayer('text', i)),
        },
      },
    ];

    for (const c of invalidCases) {
      let threw = false;
      try {
        validateProject(c.payload);
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true, `Expected validateProject to reject ${c.label}`);
    }
    return `Rejected all ${invalidCases.length} invalid/malformed project payloads cleanly with descriptive errors`;
  });

  // UT-07: Importing image, video, and audio + rejecting corrupt/unsafe files
  await runTest('UT-07', 'استيراد صورة وفيديو وصوت والتحقق من البصمة الرقمية (Media import & magic-byte validation)', () => {
    const imgAsset = importMediaFileFromDisk(fixtures.imagePath);
    const vidAsset = importMediaFileFromDisk(fixtures.videoPath);
    const audAsset = importMediaFileFromDisk(fixtures.audioPath);

    assert.strictEqual(imgAsset.kind, 'image');
    assert.strictEqual(imgAsset.width, 120);
    assert.strictEqual(imgAsset.height, 80);

    assert.strictEqual(vidAsset.kind, 'video');
    assert.strictEqual(vidAsset.width, 320);
    assert.strictEqual(vidAsset.height, 240);
    assert.ok((vidAsset.durationMs ?? 0) >= 2400 && (vidAsset.durationMs ?? 0) <= 2600);

    assert.strictEqual(audAsset.kind, 'audio');
    assert.ok((audAsset.durationMs ?? 0) >= 2900 && (audAsset.durationMs ?? 0) <= 3100);

    assert.throws(() => importMediaFileFromDisk(fixtures.corruptPath), /Unsupported or corrupted/);
    assert.throws(() => importMediaFileFromDisk('../secret/passwd'), /Path traversal/);

    return `Imported PNG (${imgAsset.width}x${imgAsset.height}), MP4 (${vidAsset.width}x${vidAsset.height}, ${vidAsset.durationMs}ms), WAV (${audAsset.durationMs}ms); rejected corrupt & traversal paths`;
  });

  // UT-08: Audio and video duration synchronization
  await runTest('UT-08', 'مزامنة مدة الصوت والفيديو ونقاط القص (Audio/video duration & trim synchronization)', () => {
    const vidAsset = importMediaFileFromDisk(fixtures.videoPath);
    const audAsset = importMediaFileFromDisk(fixtures.audioPath);

    let proj = makeProject({ durationMs: 3000, layers: [] });
    proj = addMediaLayer(proj, vidAsset);
    proj = addMediaLayer(proj, audAsset);

    const audioLayerId = proj.layers[1].id;
    proj.layers[1] = trimLayer(proj.layers[1], 500, 3000, 200, 4000);
    proj.durationMs = 3000;
    proj.layers[1] = addPropertyKeyframe(proj.layers[1], 0, 'volume', 1.0, 'linear');
    proj.layers[1] = addPropertyKeyframe(proj.layers[1], 2500, 'volume', 0.5, 'linear');

    const mixPlan = computeAudioMixPlan(proj);
    assert.strictEqual(mixPlan.tracks.length, 2);
    const aTrack = mixPlan.tracks.find((t) => t.layerId === audioLayerId)!;
    assert.strictEqual(aTrack.startMs, 500);
    assert.strictEqual(aTrack.durationMs, 2500);
    assert.strictEqual(aTrack.inPointMs, 200);
    assert.strictEqual(aTrack.outPointMs, 2700);
    assert.ok(aTrack.gain > 0.6 && aTrack.gain < 0.9);

    return `Synced ${mixPlan.tracks.length} audio tracks; audio track clamped to [start=${aTrack.startMs}ms, dur=${aTrack.durationMs}ms, in=${aTrack.inPointMs}ms, out=${aTrack.outPointMs}ms, avgGain=${aTrack.gain}]`;
  });

  const exportedMp4Path = path.resolve(
    '/working_dir/c_266ae59874133d1d/artifacts/file_generation/ttl=63d/output/integration_test_output.mp4'
  );

  // UT-09: Exporting Reference Project to MP4 + Cancellation Verification
  await runTest('UT-09', 'التصدير الفعلي إلى MP4 والتحقق من التقدم والإلغاء (Real MP4 Export & Cancellation)', async () => {
    const imgAsset = importMediaFileFromDisk(fixtures.imagePath);
    const audAsset = importMediaFileFromDisk(fixtures.audioPath);

    const textLayer = makeLayer('text', 1, {
      name: 'Timed Banner Text',
      text: 'MOTION STUDIO',
      fontSize: 42,
      color: '#FFFFFF',
      startMs: 1000,
      durationMs: 1500,
      x: 0,
      y: -10,
      opacity: 1,
    });

    let movingShape = makeLayer('shape', 2, {
      name: 'Moving Crimson Box',
      shape: 'rectangle',
      color: '#FF3366',
      width: 112,
      height: 88,
      startMs: 0,
      durationMs: 3000,
      x: -180,
      y: 120,
      rotation: 0,
      opacity: 1,
    });
    movingShape = addPropertyKeyframe(movingShape, 0, 'x', -180, 'linear');
    movingShape = addPropertyKeyframe(movingShape, 3000, 'x', 180, 'linear');

    const imageLayer = makeLayer('image', 3, {
      name: 'Static Emerald Image',
      mediaId: imgAsset.id,
      sourceUri: imgAsset.uri,
      width: 180,
      height: 108,
      startMs: 0,
      durationMs: 3000,
      x: -160,
      y: -130,
      opacity: 1,
    });

    const audioLayer = makeLayer('audio', 4, {
      name: 'Synced Sine Audio',
      mediaId: audAsset.id,
      sourceUri: audAsset.uri,
      startMs: 0,
      durationMs: 3000,
      volume: 0.9,
    });

    const project = {
      ...makeProject({
        name: 'Integration Reference Scene',
        width: 640,
        height: 480,
        fps: 20,
        durationMs: 3000,
        backgroundColor: '#121629',
        layers: [],
      }),
      mediaAssets: [imgAsset, audAsset],
      layers: [textLayer, movingShape, imageLayer, audioLayer],
    };

    // First verify pre-aborted signal cancels cleanly
    const abortCtrl = new AbortController();
    abortCtrl.abort();
    let cancelledCleanly = false;
    try {
      await exportProjectToMp4(project, {
        outputPath: path.join(fixtureDir, 'cancelled.mp4'),
        signal: abortCtrl.signal,
      });
    } catch {
      cancelledCleanly = true;
    }
    assert.strictEqual(cancelledCleanly, true);

    // Now run full MP4 export
    const progressEvents: number[] = [];
    const metadata = await exportProjectToMp4(project, {
      outputPath: exportedMp4Path,
      onProgress: (ev) => progressEvents.push(ev.percent),
    });

    assert.strictEqual(metadata.valid, true);
    assert.strictEqual(metadata.videoCodec, 'h264');
    assert.strictEqual(metadata.audioCodec, 'aac');
    assert.strictEqual(metadata.width, 640);
    assert.strictEqual(metadata.height, 480);
    assert.strictEqual(metadata.fps, 20);
    assert.strictEqual(metadata.nbFrames, 60);
    assert.strictEqual(metadata.hasAudioStream, true);
    assert.ok(progressEvents.includes(100));

    return `Exported MP4 to ${path.basename(exportedMp4Path)} (${metadata.sizeBytes} bytes, ${metadata.width}x${metadata.height}@${metadata.fps}fps, ${metadata.nbFrames} frames, ${metadata.durationSec}s, codecs=${metadata.videoCodec}/${metadata.audioCodec}); cancellation verified.`;
  });

  // UT-10: Reopening and Verifying the Resulting MP4 Video (Streams + Pixel-Level Frame Verification)
  await runTest(
    'UT-10',
    'إعادة فتح الفيديو الناتج والتحقق من الحركة والنص والصورة والصوت (Reopen & Verify Exported MP4 Frames & Audio)',
    () => {
      const verified = verifyExportedMp4(exportedMp4Path);
      assert.strictEqual(verified.valid, true);
      assert.strictEqual(verified.hasAudioStream, true);

      // Decode frames at t=0.4s (before text appears, shape on left), t=1.5s (text visible, shape at center), t=2.6s (after text disappears, shape on right)
      const frameEarly = decodeMediaFrameToRgba(exportedMp4Path, 640, 480, 400);
      const frameMid = decodeMediaFrameToRgba(exportedMp4Path, 640, 480, 1500);
      const frameLate = decodeMediaFrameToRgba(exportedMp4Path, 640, 480, 2600);
      assert.ok(frameEarly && frameMid && frameLate, 'Failed to decode frames from exported MP4');

      const getPixel = (img: { width: number; data: Uint8Array }, x: number, y: number) => {
        const i = (y * img.width + x) * 4;
        return [img.data[i], img.data[i + 1], img.data[i + 2]];
      };

      // 1. Static image at (320-160=160, 240-130=110): bright green (G > 150) across all timestamps
      const imgEarly = getPixel(frameEarly, 160, 110);
      const imgMid = getPixel(frameMid, 160, 110);
      const imgLate = getPixel(frameLate, 160, 110);
      assert.ok(imgEarly[1] > 150 && imgMid[1] > 150 && imgLate[1] > 150);

      // 2. Moving shape along y = 240 + 120 = 360:
      // At t=0.4s: x = 320 + (-180 + 360*(0.4/3.0)) = 188 (crimson R > 160)
      // At t=1.5s: x = 320 (crimson R > 160, while x=188 is now background R < 50)
      // At t=2.6s: x = 320 + (-180 + 360*(2.6/3.0)) = 452 (crimson R > 160, while x=320 is now background R < 50)
      const shapeEarlyAt188 = getPixel(frameEarly, 188, 360);
      const shapeMidAt320 = getPixel(frameMid, 320, 360);
      const bgMidAt188 = getPixel(frameMid, 188, 360);
      const shapeLateAt452 = getPixel(frameLate, 452, 360);
      assert.ok(shapeEarlyAt188[0] > 160, `Shape expected at x=188 at t=0.4s, got ${shapeEarlyAt188}`);
      assert.ok(shapeMidAt320[0] > 160, `Shape expected at x=320 at t=1.5s, got ${shapeMidAt320}`);
      assert.ok(bgMidAt188[0] < 60, `Background expected at x=188 at t=1.5s, got ${bgMidAt188}`);
      assert.ok(shapeLateAt452[0] > 160, `Shape expected at x=452 at t=2.6s, got ${shapeLateAt452}`);

      // 3. Timed text region (y in 210..250, x in 180..460): count bright white pixels (R>180, G>180, B>180)
      const countBrightTextPixels = (img: { width: number; data: Uint8Array }) => {
        let count = 0;
        for (let y = 205; y <= 255; y++) {
          for (let x = 180; x <= 460; x++) {
            const [r, g, b] = getPixel(img, x, y);
            if (r > 180 && g > 180 && b > 180) count++;
          }
        }
        return count;
      };
      const brightEarly = countBrightTextPixels(frameEarly);
      const brightMid = countBrightTextPixels(frameMid);
      const brightLate = countBrightTextPixels(frameLate);
      assert.strictEqual(brightEarly, 0, `Expected 0 text pixels at t=0.4s, got ${brightEarly}`);
      assert.ok(brightMid > 400, `Expected >400 text pixels at t=1.5s, got ${brightMid}`);
      assert.strictEqual(brightLate, 0, `Expected 0 text pixels at t=2.6s, got ${brightLate}`);

      return `Decoded MP4 frames verified: static image RGB=${imgMid.join('/')}; moving shape X tracked (188px @0.4s -> 320px @1.5s -> 452px @2.6s); timed text pixels (${brightEarly} @0.4s -> ${brightMid} @1.5s -> ${brightLate} @2.6s).`;
    }
  );

  tempMgr.cleanupAll();

  const failed = results.filter((r) => r.status === 'FAIL');
  console.log('\n======================================================');
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} TESTS PASSED`);
  console.log('======================================================');

  const reportPath = path.resolve('/tmp/ms_work/test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
