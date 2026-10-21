import type {
  AnimatedProperty,
  BezierControlPoints,
  EasingMode,
  Keyframe,
  Layer,
  LayerKind,
  MediaAsset,
  MotionProject,
} from './model';
import { makeLayer, type MakeLayerOptions, MIN_DURATION_MS } from './project';

export const clamp = (n: number, min: number, max: number): number => {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};

export function addLayer(
  project: MotionProject,
  kind: LayerKind,
  options: MakeLayerOptions = {}
): MotionProject {
  const layer = makeLayer(kind, project.layers.length + 1, {
    durationMs: project.durationMs,
    ...options,
  });
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    layers: [...project.layers, layer],
  };
}

export function addMediaLayer(project: MotionProject, asset: MediaAsset): MotionProject {
  const existingAssets = project.mediaAssets ?? [];
  const hasAsset = existingAssets.some((a) => a.id === asset.id);
  const mediaAssets = hasAsset
    ? existingAssets.map((a) => (a.id === asset.id ? asset : a))
    : [...existingAssets, asset];

  const clipDuration =
    asset.durationMs && asset.durationMs > 0
      ? Math.min(project.durationMs, Math.max(MIN_DURATION_MS, Math.round(asset.durationMs)))
      : project.durationMs;

  const layer = makeLayer(asset.kind, project.layers.length + 1, {
    name: asset.name || `${asset.kind.toUpperCase()} ${project.layers.length + 1}`,
    mediaId: asset.id,
    sourceUri: asset.uri,
    startMs: project.currentTimeMs < project.durationMs ? project.currentTimeMs : 0,
    durationMs: clipDuration,
    inPointMs: 0,
    outPointMs: clipDuration,
    width: asset.width ?? (asset.kind === 'audio' ? undefined : 480),
    height: asset.height ?? (asset.kind === 'audio' ? undefined : 320),
    volume: asset.kind === 'video' || asset.kind === 'audio' ? 1 : 0,
  });

  const requiredDuration = Math.max(project.durationMs, layer.startMs + layer.durationMs);
  return {
    ...project,
    durationMs: requiredDuration,
    mediaAssets,
    updatedAt: new Date().toISOString(),
    layers: [...project.layers, layer],
  };
}

export function removeLayer(project: MotionProject, layerId: string): MotionProject {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    layers: project.layers.filter((l) => l.id !== layerId),
  };
}

export function duplicateLayer(project: MotionProject, layerId: string): MotionProject {
  const index = project.layers.findIndex((l) => l.id === layerId);
  if (index === -1) return project;
  const source = project.layers[index];
  const copyId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const copy: Layer = {
    ...source,
    id: copyId,
    name: `${source.name} Copy`,
    keyframes: source.keyframes.map((k) => ({
      ...k,
      id: `${k.property ?? 'opacity'}-${k.timeMs}-${Math.random().toString(36).slice(2, 5)}`,
    })),
    effects: source.effects.map((e) => ({ ...e })),
  };
  const nextLayers = [...project.layers];
  nextLayers.splice(index + 1, 0, copy);
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    layers: nextLayers,
  };
}

export function reorderLayer(project: MotionProject, fromIndex: number, toIndex: number): MotionProject {
  if (
    fromIndex < 0 ||
    fromIndex >= project.layers.length ||
    toIndex < 0 ||
    toIndex >= project.layers.length ||
    fromIndex === toIndex
  ) {
    return project;
  }
  const nextLayers = [...project.layers];
  const [moved] = nextLayers.splice(fromIndex, 1);
  nextLayers.splice(toIndex, 0, moved);
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    layers: nextLayers,
  };
}

export function moveLayerOrder(
  project: MotionProject,
  layerId: string,
  direction: 'up' | 'down' | 'front' | 'back'
): MotionProject {
  const index = project.layers.findIndex((l) => l.id === layerId);
  if (index === -1) return project;
  const lastIndex = project.layers.length - 1;
  // Note: index 0 is rendered on top in the timeline list (or frontmost when reversed in painter's algorithm).
  let targetIndex = index;
  if (direction === 'up') targetIndex = Math.max(0, index - 1);
  else if (direction === 'down') targetIndex = Math.min(lastIndex, index + 1);
  else if (direction === 'front') targetIndex = 0;
  else if (direction === 'back') targetIndex = lastIndex;
  return reorderLayer(project, index, targetIndex);
}

export function trimLayer(
  layer: Layer,
  newStartMs: number,
  newDurationMs: number,
  newInPointMs?: number,
  maxProjectDurationMs = 3_600_000
): Layer {
  if (layer.locked) return layer;
  const startMs = clamp(Math.round(newStartMs), 0, maxProjectDurationMs - MIN_DURATION_MS);
  const durationMs = clamp(Math.round(newDurationMs), MIN_DURATION_MS, maxProjectDurationMs - startMs);
  const inPointMs =
    newInPointMs !== undefined
      ? Math.max(0, Math.round(newInPointMs))
      : Math.max(0, layer.inPointMs ?? 0);
  const outPointMs = inPointMs + durationMs;

  // Clamp or retain keyframes within the new [0, durationMs] local window
  const adjustedKeyframes = layer.keyframes.map((k) => ({
    ...k,
    timeMs: clamp(k.timeMs, 0, durationMs),
  }));

  return {
    ...layer,
    startMs,
    durationMs,
    inPointMs,
    outPointMs,
    keyframes: adjustedKeyframes.sort((a, b) => a.timeMs - b.timeMs),
  };
}

export function splitLayerAtTime(
  project: MotionProject,
  layerId: string,
  splitTimeMs: number
): MotionProject {
  const index = project.layers.findIndex((l) => l.id === layerId);
  if (index === -1) return project;
  const layer = project.layers[index];
  if (layer.locked) return project;

  const localSplitMs = Math.round(splitTimeMs - layer.startMs);
  if (localSplitMs < MIN_DURATION_MS || layer.durationMs - localSplitMs < MIN_DURATION_MS) {
    return project;
  }

  const baseInPoint = layer.inPointMs ?? 0;
  const firstHalf: Layer = {
    ...layer,
    durationMs: localSplitMs,
    inPointMs: baseInPoint,
    outPointMs: baseInPoint + localSplitMs,
    keyframes: layer.keyframes.filter((k) => k.timeMs <= localSplitMs),
  };

  const secondHalfId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const secondHalf: Layer = {
    ...layer,
    id: secondHalfId,
    name: `${layer.name} (Part 2)`,
    startMs: layer.startMs + localSplitMs,
    durationMs: layer.durationMs - localSplitMs,
    inPointMs: baseInPoint + localSplitMs,
    outPointMs: baseInPoint + layer.durationMs,
    keyframes: layer.keyframes
      .filter((k) => k.timeMs >= localSplitMs)
      .map((k) => ({
        ...k,
        id: `${k.property ?? 'opacity'}-${k.timeMs - localSplitMs}-${Math.random().toString(36).slice(2, 5)}`,
        timeMs: k.timeMs - localSplitMs,
      })),
  };

  const nextLayers = [...project.layers];
  nextLayers.splice(index, 1, firstHalf, secondHalf);
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    layers: nextLayers,
  };
}

export function movePlayhead(project: MotionProject, timeMs: number): MotionProject {
  return {
    ...project,
    currentTimeMs: clamp(timeMs, 0, project.durationMs),
  };
}

export function stepFrame(project: MotionProject, deltaFrames: number): MotionProject {
  const fps = Math.max(1, project.fps || 30);
  const frameDurationMs = 1000 / fps;
  const currentFrame = Math.round(project.currentTimeMs / frameDurationMs);
  const nextFrame = currentFrame + deltaFrames;
  const nextTimeMs = Math.round(nextFrame * frameDurationMs);
  return movePlayhead(project, nextTimeMs);
}

function resolveLayerPropertyValue(layer: Layer, property: AnimatedProperty): number {
  switch (property) {
    case 'opacity':
      return layer.opacity;
    case 'x':
      return layer.x;
    case 'y':
      return layer.y;
    case 'scale':
      return layer.scale;
    case 'rotation':
      return layer.rotation ?? 0;
    case 'volume':
      return layer.volume ?? 1;
  }
}

export function addPropertyKeyframe(
  layer: Layer,
  timeMs: number,
  property: AnimatedProperty,
  valueOverride?: number,
  easing: EasingMode = 'linear',
  controlPoints?: BezierControlPoints
): Layer {
  if (layer.locked) return layer;
  const clampedTime = clamp(Math.round(timeMs), 0, layer.durationMs);
  const value = valueOverride !== undefined ? valueOverride : resolveLayerPropertyValue(layer, property);
  const id = `${property}-${clampedTime}`;
  const keyframes = layer.keyframes.filter(
    (k) => !(k.timeMs === clampedTime && (k.property === property || k.id.startsWith(`${property}-`)))
  );
  const nextKf: Keyframe = {
    id,
    timeMs: clampedTime,
    value,
    easing,
    property,
  };
  if (easing === 'cubicBezier') {
    nextKf.controlPoints = controlPoints ?? [0.42, 0, 0.58, 1];
  }
  keyframes.push(nextKf);
  return {
    ...layer,
    keyframes: keyframes.sort((a, b) => a.timeMs - b.timeMs),
  };
}

export function removeKeyframe(layer: Layer, keyframeId: string): Layer {
  if (layer.locked) return layer;
  return {
    ...layer,
    keyframes: layer.keyframes.filter((k) => k.id !== keyframeId),
  };
}

export function updateKeyframeEasing(
  layer: Layer,
  keyframeId: string,
  easing: EasingMode,
  controlPoints?: BezierControlPoints
): Layer {
  if (layer.locked) return layer;
  return {
    ...layer,
    keyframes: layer.keyframes.map((k) =>
      k.id === keyframeId
        ? {
            ...k,
            easing,
            controlPoints: easing === 'cubicBezier' ? controlPoints ?? k.controlPoints ?? [0.42, 0, 0.58, 1] : undefined,
          }
        : k
    ),
  };
}

export function addOpacityKeyframe(layer: Layer, timeMs: number): Layer {
  return addPropertyKeyframe(layer, timeMs, 'opacity');
}
