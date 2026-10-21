export type LayerKind = 'text' | 'shape' | 'image' | 'video' | 'audio';

export type AnimatedProperty = 'opacity' | 'x' | 'y' | 'scale' | 'rotation' | 'volume';

export type EasingMode =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'step'
  | 'cubicBezier';

/** Cubic Bezier control points [x1, y1, x2, y2] where x1, x2 are in [0, 1]. */
export type BezierControlPoints = [number, number, number, number];

export type Keyframe = {
  id: string;
  timeMs: number;
  value: number;
  easing: EasingMode;
  property?: AnimatedProperty;
  /** Optional custom cubic-bezier control points when easing === 'cubicBezier'. */
  controlPoints?: BezierControlPoints;
};

export type EffectType = 'brightness' | 'blur' | 'opacity' | 'saturation' | 'contrast';

export type Effect = {
  id: string;
  type: EffectType;
  amount: number;
  enabled: boolean;
};

export type ShapeKind = 'rectangle' | 'circle' | 'rounded' | 'triangle';

export type MediaAssetStatus = 'ready' | 'missing' | 'corrupt' | 'unsupported';

export type MediaAsset = {
  id: string;
  name: string;
  kind: 'image' | 'video' | 'audio';
  uri: string;
  mimeType: string;
  sizeBytes: number;
  durationMs?: number;
  width?: number;
  height?: number;
  fps?: number;
  hasAudio?: boolean;
  sha256?: string;
  status: MediaAssetStatus;
  errorMessage?: string;
};

export type Layer = {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
  /** Timeline start offset in milliseconds relative to project start (0). */
  startMs: number;
  /** Active clip duration on the timeline in milliseconds. */
  durationMs: number;
  /** Media source trim in-point in milliseconds (default 0). */
  inPointMs?: number;
  /** Media source trim out-point in milliseconds (default inPointMs + durationMs). */
  outPointMs?: number;
  /** Base opacity in [0, 1]. */
  opacity: number;
  /** Base X offset from canvas center in pixels. */
  x: number;
  /** Base Y offset from canvas center in pixels. */
  y: number;
  /** Base uniform scale multiplier (1 = 100%). */
  scale: number;
  /** Base rotation in degrees. */
  rotation?: number;
  /** Text content for text layers. */
  text?: string;
  /** Font size in pixels for text layers. */
  fontSize?: number;
  /** Fill/text color in hex (#RRGGBB or #RRGGBBAA). */
  color?: string;
  /** Geometric shape type for shape layers. */
  shape?: ShapeKind;
  /** Explicit width in pixels for shape/image/video layers before scaling. */
  width?: number;
  /** Explicit height in pixels for shape/image/video layers before scaling. */
  height?: number;
  /** Reference to a MediaAsset in project.mediaAssets. */
  mediaId?: string;
  /** Direct URI fallback for imported media. */
  sourceUri?: string;
  /** Base audio volume for video/audio layers in [0, 2] (1 = 100%). */
  volume?: number;
  /** Mute flag for video/audio layers. */
  muted?: boolean;
  keyframes: Keyframe[];
  effects: Effect[];
};

export type AudioSettings = {
  masterVolume: number;
  muted: boolean;
  sampleRate: 44100 | 48000;
  channels: 1 | 2;
};

export type ExportSettings = {
  width: number;
  height: number;
  fps: number;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  codec: 'h264';
  preset: 'ultrafast' | 'fast' | 'medium';
  format: 'mp4';
};

export type MotionProject = {
  /** Schema version: v2 is current; v1 projects are automatically upgraded on load. */
  schemaVersion: 1 | 2;
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  width: number;
  height: number;
  fps: number;
  durationMs: number;
  currentTimeMs: number;
  backgroundColor?: string;
  mediaAssets?: MediaAsset[];
  audioSettings?: AudioSettings;
  exportSettings?: ExportSettings;
  layers: Layer[];
};
