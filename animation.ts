import type { AnimatedProperty, BezierControlPoints, EasingMode, Keyframe, Layer } from './model';
import { clamp } from './timeline';

export type AnimatedLayerState = {
  opacity: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  volume: number;
  active: boolean;
  localTimeMs: number;
  sourceTimeMs: number;
};

/** Resolve a keyframe's animated property. Older schema-v1 keyframes are treated as opacity keys. */
export function keyframeProperty(keyframe: Keyframe): AnimatedProperty {
  const property = keyframe.property;
  if (
    property === 'x' ||
    property === 'y' ||
    property === 'scale' ||
    property === 'opacity' ||
    property === 'rotation' ||
    property === 'volume'
  ) {
    return property;
  }
  if (keyframe.id.startsWith('x-')) return 'x';
  if (keyframe.id.startsWith('y-')) return 'y';
  if (keyframe.id.startsWith('scale-')) return 'scale';
  if (keyframe.id.startsWith('rotation-')) return 'rotation';
  if (keyframe.id.startsWith('volume-')) return 'volume';
  return 'opacity';
}

/**
 * Evaluates a 1D cubic bezier curve B(s) for control points (0, 0), (p1, p2), (1, 1) at parameter s in [0, 1].
 */
function sampleCurve(p1: number, p2: number, s: number): number {
  const inv = 1 - s;
  return 3 * inv * inv * s * p1 + 3 * inv * s * s * p2 + s * s * s;
}

function sampleCurveDerivative(p1: number, p2: number, s: number): number {
  const inv = 1 - s;
  return 3 * inv * inv * p1 + 6 * inv * s * (p2 - p1) + 3 * s * s * (1 - p2);
}

/**
 * Solves cubic-bezier(x1, y1, x2, y2) for normalized progress t in [0, 1] using
 * Newton-Raphson with binary-search fallback.
 */
export function solveCubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number
): number {
  const x = clamp(t, 0, 1);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const cx1 = clamp(x1, 0, 1);
  const cx2 = clamp(x2, 0, 1);
  if (cx1 === y1 && cx2 === y2) return x;

  let s = x;
  // Newton-Raphson iterations
  for (let i = 0; i < 8; i++) {
    const currentX = sampleCurve(cx1, cx2, s) - x;
    if (Math.abs(currentX) < 1e-6) {
      return sampleCurve(y1, y2, s);
    }
    const derivative = sampleCurveDerivative(cx1, cx2, s);
    if (Math.abs(derivative) < 1e-6) break;
    s -= currentX / derivative;
  }

  // Fallback to binary subdivision
  let low = 0;
  let high = 1;
  s = x;
  for (let i = 0; i < 16; i++) {
    const currentX = sampleCurve(cx1, cx2, s);
    if (Math.abs(currentX - x) < 1e-6) break;
    if (x > currentX) low = s;
    else high = s;
    s = (high + low) * 0.5;
  }
  return sampleCurve(y1, y2, s);
}

export function ease(
  t: number,
  mode: EasingMode,
  controlPoints?: BezierControlPoints
): number {
  const x = clamp(t, 0, 1);
  switch (mode) {
    case 'easeIn':
      return x * x;
    case 'easeOut':
      return 1 - (1 - x) * (1 - x);
    case 'easeInOut':
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case 'step':
      return x >= 1 ? 1 : 0;
    case 'cubicBezier': {
      const [x1, y1, x2, y2] = controlPoints ?? [0.42, 0, 0.58, 1];
      return solveCubicBezier(x1, y1, x2, y2, x);
    }
    default:
      return x;
  }
}

export function sortKeyframesDeterministically(keyframes: Keyframe[]): Keyframe[] {
  return keyframes
    .map((kf, idx) => ({ kf, idx }))
    .sort((a, b) => (a.kf.timeMs !== b.kf.timeMs ? a.kf.timeMs - b.kf.timeMs : a.idx - b.idx))
    .map((entry) => entry.kf);
}

export function interpolateKeyframes(
  keyframes: Keyframe[],
  timeMs: number,
  fallback: number
): number {
  if (!keyframes.length) return fallback;
  const sorted = sortKeyframesDeterministically(keyframes);
  if (timeMs <= sorted[0].timeMs) {
    // If multiple keyframes exist at sorted[0].timeMs and timeMs === sorted[0].timeMs,
    // use the last keyframe at that exact timestamp.
    if (timeMs === sorted[0].timeMs) {
      let idx = 0;
      while (idx + 1 < sorted.length && sorted[idx + 1].timeMs === sorted[0].timeMs) {
        idx++;
      }
      return sorted[idx].value;
    }
    return sorted[0].value;
  }
  const last = sorted[sorted.length - 1];
  if (timeMs >= last.timeMs) return last.value;

  for (let i = 0; i < sorted.length - 1; i++) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (timeMs < left.timeMs || timeMs > right.timeMs) continue;
    const span = right.timeMs - left.timeMs;
    if (span <= 0) {
      continue;
    }
    if (left.easing === 'step') {
      return timeMs >= right.timeMs ? right.value : left.value;
    }
    const progress = ease((timeMs - left.timeMs) / span, left.easing, left.controlPoints);
    return left.value + (right.value - left.value) * progress;
  }
  return last.value;
}

export function evaluateLayerAtTime(layer: Layer, projectTimeMs: number): AnimatedLayerState {
  const localTimeMs = projectTimeMs - layer.startMs;
  const active =
    layer.durationMs > 0 && localTimeMs >= 0 && localTimeMs <= layer.durationMs;
  const inPointMs = layer.inPointMs ?? 0;
  const sourceTimeMs = Math.max(inPointMs, inPointMs + localTimeMs);

  const baseRotation = layer.rotation ?? 0;
  const baseVolume = layer.muted ? 0 : layer.volume ?? (layer.kind === 'video' || layer.kind === 'audio' ? 1 : 0);

  if (!active || !layer.visible) {
    return {
      opacity: 0,
      x: layer.x,
      y: layer.y,
      scale: layer.scale,
      rotation: baseRotation,
      volume: 0,
      active: false,
      localTimeMs,
      sourceTimeMs,
    };
  }

  const grouped: Record<AnimatedProperty, Keyframe[]> = {
    opacity: [],
    x: [],
    y: [],
    scale: [],
    rotation: [],
    volume: [],
  };
  for (const keyframe of layer.keyframes) {
    grouped[keyframeProperty(keyframe)].push(keyframe);
  }

  const rawVolume = interpolateKeyframes(grouped.volume, localTimeMs, layer.volume ?? 1);
  return {
    opacity: clamp(interpolateKeyframes(grouped.opacity, localTimeMs, layer.opacity), 0, 1),
    x: interpolateKeyframes(grouped.x, localTimeMs, layer.x),
    y: interpolateKeyframes(grouped.y, localTimeMs, layer.y),
    scale: clamp(interpolateKeyframes(grouped.scale, localTimeMs, layer.scale), 0.01, 100),
    rotation: clamp(interpolateKeyframes(grouped.rotation, localTimeMs, baseRotation), -36000, 36000),
    volume: layer.muted ? 0 : clamp(rawVolume, 0, 2),
    active: true,
    localTimeMs,
    sourceTimeMs,
  };
}
