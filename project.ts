import type {
  AudioSettings,
  ExportSettings,
  Keyframe,
  Layer,
  LayerKind,
  MediaAsset,
  MotionProject,
} from './model';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const MAX_LAYERS = 200;
export const MAX_DURATION_MS = 3_600_000; // 1 hour max
export const MIN_DURATION_MS = 100;
export const MAX_DIMENSION = 7680; // 8K max
export const MIN_DIMENSION = 16;
export const DEFAULT_BG_COLOR = '#121629';

const VALID_LAYER_KINDS: readonly LayerKind[] = ['text', 'shape', 'image', 'video', 'audio'];
const VALID_EASINGS = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'step', 'cubicBezier'] as const;
const VALID_PROPERTIES = ['opacity', 'x', 'y', 'scale', 'rotation', 'volume'] as const;

export function makeDefaultAudioSettings(): AudioSettings {
  return {
    masterVolume: 1,
    muted: false,
    sampleRate: 44100,
    channels: 2,
  };
}

export function makeDefaultExportSettings(width = 1080, height = 1920, fps = 30): ExportSettings {
  return {
    width,
    height,
    fps,
    videoBitrateKbps: 6000,
    audioBitrateKbps: 192,
    codec: 'h264',
    preset: 'fast',
    format: 'mp4',
  };
}

export type MakeLayerOptions = Partial<Omit<Layer, 'id' | 'kind'>>;

export function makeLayer(kind: LayerKind, index: number, options: MakeLayerOptions = {}): Layer {
  const defaultDuration = options.durationMs ?? 5000;
  const inPointMs = options.inPointMs ?? 0;
  const outPointMs = options.outPointMs ?? inPointMs + defaultDuration;
  const defaultWidth =
    kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 480 : undefined;
  const defaultHeight =
    kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 320 : undefined;

  return {
    id: uid(),
    name: options.name ?? `${kind[0].toUpperCase()}${kind.slice(1)} ${index}`,
    kind,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    startMs: options.startMs ?? 0,
    durationMs: defaultDuration,
    inPointMs,
    outPointMs,
    opacity: options.opacity ?? 1,
    x: options.x ?? 0,
    y: options.y ?? 0,
    scale: options.scale ?? 1,
    rotation: options.rotation ?? (kind === 'shape' ? 22 : 0),
    text: options.text ?? (kind === 'text' ? 'Your Motion' : ''),
    fontSize: options.fontSize ?? (kind === 'text' ? 56 : undefined),
    color: options.color ?? (kind === 'shape' ? '#8B7CFF' : '#FFFFFF'),
    shape: options.shape ?? 'rectangle',
    width: options.width ?? defaultWidth,
    height: options.height ?? defaultHeight,
    mediaId: options.mediaId,
    sourceUri: options.sourceUri,
    volume: options.volume ?? (kind === 'video' || kind === 'audio' ? 1 : 0),
    muted: options.muted ?? false,
    keyframes: options.keyframes ? [...options.keyframes] : [],
    effects: options.effects ? [...options.effects] : [],
  };
}

export type MakeProjectOptions = Partial<
  Pick<MotionProject, 'name' | 'width' | 'height' | 'fps' | 'durationMs' | 'backgroundColor' | 'layers'>
>;

export function makeProject(options: MakeProjectOptions = {}): MotionProject {
  const width = options.width ?? 1080;
  const height = options.height ?? 1920;
  const fps = options.fps ?? 30;
  const durationMs = options.durationMs ?? 5000;
  const now = new Date().toISOString();
  return {
    schemaVersion: 2,
    id: uid(),
    name: options.name ?? 'Untitled Project',
    createdAt: now,
    updatedAt: now,
    width,
    height,
    fps,
    durationMs,
    currentTimeMs: 0,
    backgroundColor: options.backgroundColor ?? DEFAULT_BG_COLOR,
    mediaAssets: [],
    audioSettings: makeDefaultAudioSettings(),
    exportSettings: makeDefaultExportSettings(width, height, fps),
    layers: options.layers ?? [makeLayer('text', 1, { durationMs }), makeLayer('shape', 2, { durationMs })],
  };
}

function hasForbiddenPrototypeKeys(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const ownKeys = Object.getOwnPropertyNames(obj);
  if (ownKeys.includes('__proto__') || ownKeys.includes('constructor') || ownKeys.includes('prototype')) {
    return true;
  }
  for (const key of ownKeys) {
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === 'object' && hasForbiddenPrototypeKeys(val)) {
      return true;
    }
  }
  return false;
}

export function isValidHexColor(color: unknown): color is string {
  return typeof color === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Upgrades schemaVersion 1 projects (from MVP / v2 / v3) to schemaVersion 2
 * without losing any layers, keyframes, effects, or custom properties.
 */
export function migrateProject(raw: unknown): MotionProject {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Project must be a non-null JSON object.');
  }
  if (hasForbiddenPrototypeKeys(raw)) {
    throw new Error('Security violation: project JSON contains forbidden prototype keys.');
  }

  const input = raw as Record<string, unknown>;
  const version = input.schemaVersion;
  if (version !== 1 && version !== 2) {
    throw new Error(`Unsupported or invalid project schemaVersion: ${String(version)}.`);
  }

  if (
    typeof input.width !== 'number' ||
    !Number.isFinite(input.width) ||
    input.width < MIN_DIMENSION ||
    input.width > MAX_DIMENSION
  ) {
    throw new Error(`Invalid project width: must be a finite number between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`);
  }
  if (
    typeof input.height !== 'number' ||
    !Number.isFinite(input.height) ||
    input.height < MIN_DIMENSION ||
    input.height > MAX_DIMENSION
  ) {
    throw new Error(`Invalid project height: must be a finite number between ${MIN_DIMENSION} and ${MAX_DIMENSION}.`);
  }

  const width = Math.round(input.width);
  const height = Math.round(input.height);
  const fps =
    typeof input.fps === 'number' && Number.isFinite(input.fps) && input.fps >= 1 && input.fps <= 240
      ? Math.round(input.fps)
      : 30;
  const durationMs =
    typeof input.durationMs === 'number' &&
    Number.isFinite(input.durationMs) &&
    input.durationMs >= MIN_DURATION_MS &&
    input.durationMs <= MAX_DURATION_MS
      ? Math.round(input.durationMs)
      : 5000;

  if (!Array.isArray(input.layers)) {
    throw new Error('Invalid project schema: layers must be an array.');
  }
  if (input.layers.length > MAX_LAYERS) {
    throw new Error(`Project exceeds the maximum limit of ${MAX_LAYERS} layers.`);
  }

  const migratedLayers: Layer[] = input.layers.map((rawLayer, idx) => {
    if (!rawLayer || typeof rawLayer !== 'object' || Array.isArray(rawLayer)) {
      throw new Error(`Invalid layer at index ${idx}: must be an object.`);
    }
    const l = rawLayer as Record<string, unknown>;
    const kind = l.kind as LayerKind;
    if (!VALID_LAYER_KINDS.includes(kind)) {
      throw new Error(`Invalid layer kind at index ${idx}: "${String(l.kind)}".`);
    }
    if (typeof l.startMs === 'number' && (!Number.isFinite(l.startMs) || l.startMs < 0)) {
      throw new Error(`Invalid layer startMs at index ${idx}: must be >= 0.`);
    }
    if (typeof l.durationMs === 'number' && (!Number.isFinite(l.durationMs) || l.durationMs <= 0)) {
      throw new Error(`Invalid layer durationMs at index ${idx}: must be > 0.`);
    }

    const startMs = typeof l.startMs === 'number' ? l.startMs : 0;
    const layerDuration = typeof l.durationMs === 'number' ? l.durationMs : durationMs;
    const inPointMs =
      typeof l.inPointMs === 'number' && Number.isFinite(l.inPointMs) && l.inPointMs >= 0 ? l.inPointMs : 0;
    const outPointMs =
      typeof l.outPointMs === 'number' && Number.isFinite(l.outPointMs) && l.outPointMs >= inPointMs
        ? l.outPointMs
        : inPointMs + layerDuration;

    const rawKeyframes = Array.isArray(l.keyframes) ? l.keyframes : [];
    const keyframes: Keyframe[] = rawKeyframes.map((rk, kIdx) => {
      if (!rk || typeof rk !== 'object') {
        throw new Error(`Invalid keyframe at layer ${idx}, index ${kIdx}.`);
      }
      const k = rk as Record<string, unknown>;
      if (typeof k.timeMs !== 'number' || !Number.isFinite(k.timeMs) || typeof k.value !== 'number' || !Number.isFinite(k.value)) {
        throw new Error(`Keyframe at layer ${idx}, index ${kIdx} has non-numeric timeMs or value.`);
      }
      const easing = VALID_EASINGS.includes(k.easing as any) ? (k.easing as Keyframe['easing']) : 'linear';
      const idStr = typeof k.id === 'string' && k.id.length > 0 ? k.id : `kf-${idx}-${kIdx}-${k.timeMs}`;
      const inferredProp =
        VALID_PROPERTIES.includes(k.property as any)
          ? (k.property as Keyframe['property'])
          : idStr.startsWith('x-')
          ? 'x'
          : idStr.startsWith('y-')
          ? 'y'
          : idStr.startsWith('scale-')
          ? 'scale'
          : idStr.startsWith('rotation-')
          ? 'rotation'
          : idStr.startsWith('volume-')
          ? 'volume'
          : 'opacity';

      const kf: Keyframe = {
        id: idStr,
        timeMs: k.timeMs,
        value: k.value,
        easing,
        property: inferredProp,
      };
      if (
        Array.isArray(k.controlPoints) &&
        k.controlPoints.length === 4 &&
        k.controlPoints.every((n) => typeof n === 'number' && Number.isFinite(n))
      ) {
        kf.controlPoints = [
          Math.max(0, Math.min(1, k.controlPoints[0])),
          k.controlPoints[1],
          Math.max(0, Math.min(1, k.controlPoints[2])),
          k.controlPoints[3],
        ];
      }
      return kf;
    });

    const colorStr = isValidHexColor(l.color)
      ? l.color
      : kind === 'shape'
      ? '#8B7CFF'
      : '#FFFFFF';

    return {
      id: typeof l.id === 'string' && l.id.length > 0 ? l.id : uid(),
      name: typeof l.name === 'string' && l.name.length > 0 ? l.name : `${kind} ${idx + 1}`,
      kind,
      visible: typeof l.visible === 'boolean' ? l.visible : true,
      locked: typeof l.locked === 'boolean' ? l.locked : false,
      startMs,
      durationMs: layerDuration,
      inPointMs,
      outPointMs,
      opacity:
        typeof l.opacity === 'number' && Number.isFinite(l.opacity)
          ? Math.max(0, Math.min(1, l.opacity))
          : 1,
      x: typeof l.x === 'number' && Number.isFinite(l.x) ? l.x : 0,
      y: typeof l.y === 'number' && Number.isFinite(l.y) ? l.y : 0,
      scale:
        typeof l.scale === 'number' && Number.isFinite(l.scale) && l.scale > 0
          ? Math.max(0.01, Math.min(100, l.scale))
          : 1,
      rotation: typeof l.rotation === 'number' && Number.isFinite(l.rotation) ? l.rotation : 0,
      text: typeof l.text === 'string' ? l.text : kind === 'text' ? 'Your Motion' : '',
      fontSize:
        typeof l.fontSize === 'number' && Number.isFinite(l.fontSize) && l.fontSize > 4
          ? l.fontSize
          : kind === 'text'
          ? 56
          : undefined,
      color: colorStr,
      shape:
        l.shape === 'circle' || l.shape === 'rectangle' || l.shape === 'rounded' || l.shape === 'triangle'
          ? l.shape
          : 'rectangle',
      width:
        typeof l.width === 'number' && Number.isFinite(l.width) && l.width > 0
          ? l.width
          : kind === 'shape'
          ? 240
          : kind === 'image' || kind === 'video'
          ? 480
          : undefined,
      height:
        typeof l.height === 'number' && Number.isFinite(l.height) && l.height > 0
          ? l.height
          : kind === 'shape'
          ? 240
          : kind === 'image' || kind === 'video'
          ? 320
          : undefined,
      mediaId: typeof l.mediaId === 'string' ? l.mediaId : undefined,
      sourceUri: typeof l.sourceUri === 'string' ? l.sourceUri : undefined,
      volume:
        typeof l.volume === 'number' && Number.isFinite(l.volume)
          ? Math.max(0, Math.min(2, l.volume))
          : kind === 'video' || kind === 'audio'
          ? 1
          : 0,
      muted: typeof l.muted === 'boolean' ? l.muted : false,
      keyframes: keyframes.sort((a, b) => a.timeMs - b.timeMs),
      effects: Array.isArray(l.effects) ? (l.effects as Layer['effects']) : [],
    };
  });

  const mediaAssets: MediaAsset[] = Array.isArray(input.mediaAssets)
    ? (input.mediaAssets as MediaAsset[]).filter(
        (m) => m && typeof m === 'object' && typeof m.id === 'string' && typeof m.uri === 'string'
      )
    : [];

  const currentTimeMs =
    typeof input.currentTimeMs === 'number' && Number.isFinite(input.currentTimeMs)
      ? Math.max(0, Math.min(durationMs, input.currentTimeMs))
      : 0;

  return {
    schemaVersion: 2,
    id: typeof input.id === 'string' && input.id.length > 0 ? input.id : uid(),
    name: typeof input.name === 'string' && input.name.trim().length > 0 ? input.name.trim() : 'Untitled Project',
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    width,
    height,
    fps,
    durationMs,
    currentTimeMs,
    backgroundColor: isValidHexColor(input.backgroundColor) ? input.backgroundColor : DEFAULT_BG_COLOR,
    mediaAssets,
    audioSettings:
      input.audioSettings && typeof input.audioSettings === 'object'
        ? {
            ...makeDefaultAudioSettings(),
            ...(input.audioSettings as Partial<AudioSettings>),
          }
        : makeDefaultAudioSettings(),
    exportSettings:
      input.exportSettings && typeof input.exportSettings === 'object'
        ? {
            ...makeDefaultExportSettings(width, height, fps),
            ...(input.exportSettings as Partial<ExportSettings>),
          }
        : makeDefaultExportSettings(width, height, fps),
    layers: migratedLayers,
  };
}

export function validateProject(input: unknown): MotionProject {
  return migrateProject(input);
}

export function serializeProject(project: MotionProject): string {
  return JSON.stringify(project, null, 2);
}
