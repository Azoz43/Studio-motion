# Motion Studio v0.4.0 (Schema v2)

An independent, clean-room mobile motion & video editor built with React Native, Expo, TypeScript, and a deterministic scene evaluation & media encoding pipeline.

## Key Capabilities (v0.4.0)
- **Versioned Project & Scene Model (`schemaVersion: 2`)**: Automatic lossless migration from `schemaVersion: 1` projects (`mvp`, `v2`, `v3`), with canvas dimensions, FPS, duration, background color, media assets registry, audio settings, and export settings.
- **Full Layer System**: Supports `text`, `shape` (`rectangle`, `circle`, `rounded`, `triangle`), `image`, `video`, and `audio` layers with trimming (`startMs`, `durationMs`, `inPointMs`, `outPointMs`), clip splitting at playhead (`splitLayerAtTime`), z-order reordering (`up`, `down`, `front`, `back`), duplication, deletion, visibility, and lock controls.
- **Keyframe & Interpolation Engine**: Deterministic keyframe evaluation for `opacity`, `x`, `y`, `scale`, `rotation`, and `volume` with `linear`, `easeIn`, `easeOut`, `easeInOut`, `cubicBezier` (Newton-Raphson + binary subdivision solver), and `step` modes.
- **Decoupled Preview Architecture**:
  - `src/core/preview.ts`: Pure `evaluateSceneAtTime` and `PlaybackController` (including frame-accurate stepping `-1f` / `+1f`).
  - `src/components/PreviewCanvas.tsx`: Dedicated React Native view renderer in painter's back-to-front order.
- **Real Media Pipeline & MP4 Exporter**:
  - `src/security/validation.ts`: Binary magic-byte inspection (PNG, JPEG, WEBP, GIF, MP4/MOV/M4A, WAV, MP3, OGG), path traversal protection, file size limits, and log sanitization.
  - `src/storage/projectStorage.ts`: Atomic save staging (`.tmp` -> verify -> `.bak` rotation -> primary commit) with automatic backup recovery and last-project reopen on startup.
  - `src/media/mediaPipeline.ts`: Media metadata probing and `computeAudioMixPlan` for multi-track audio/video duration & gain synchronization.
  - `src/media/softwareRasterizer.ts` & `src/media/exporter.ts`: O(1)-memory RGBA frame compositor and H.264/AAC MP4 encoder + `ffprobe` output verifier.
  - `android/app/src/main/java/com/example/motionstudio/MotionStudioMediaModule.kt`: Hardware-accelerated Android native `MediaCodec` + `MediaMetadataRetriever` + `MediaMuxer` module (zero GPL dependencies).

## Running & Testing
```bash
# Compile TypeScript/TSX and run all 10 unit + integration tests (including real MP4 export verification):
npm test

# Start Expo development server (in a network-enabled environment after npm install):
npm install
npx expo start

# Build installable Android APK (requires Android SDK 35 & Gradle in environment):
npm run apk:debug
npm run apk:release
```
