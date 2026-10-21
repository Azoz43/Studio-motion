import { evaluateLayerAtTime, type AnimatedLayerState } from './animation';
import type { Layer, MediaAsset, MediaAssetStatus, MotionProject, ShapeKind } from './model';
import { DEFAULT_BG_COLOR } from './project';
import { clamp, movePlayhead, stepFrame } from './timeline';

export type ResolvedMediaState = {
  hasSource: boolean;
  uri?: string;
  asset?: MediaAsset;
  status: MediaAssetStatus | 'unassigned';
  warning?: string;
};

export type EvaluatedVisualNode = {
  layerId: string;
  name: string;
  kind: 'text' | 'shape' | 'image' | 'video';
  paintOrder: number;
  timelineIndex: number;
  state: AnimatedLayerState;
  width: number;
  height: number;
  color: string;
  text?: string;
  fontSize?: number;
  shape?: ShapeKind;
  media?: ResolvedMediaState;
};

export type EvaluatedAudioNode = {
  layerId: string;
  name: string;
  kind: 'video' | 'audio';
  timelineIndex: number;
  localTimeMs: number;
  sourceTimeMs: number;
  layerVolume: number;
  effectiveGain: number;
  muted: boolean;
  media: ResolvedMediaState;
};

export type EvaluatedScene = {
  projectId: string;
  width: number;
  height: number;
  fps: number;
  durationMs: number;
  timeMs: number;
  frameIndex: number;
  backgroundColor: string;
  visualNodes: EvaluatedVisualNode[];
  audioNodes: EvaluatedAudioNode[];
  warnings: string[];
};

export function resolveLayerMedia(layer: Layer, project: MotionProject): ResolvedMediaState {
  if (layer.kind !== 'image' && layer.kind !== 'video' && layer.kind !== 'audio') {
    return { hasSource: true, status: 'ready' };
  }
  const assets = project.mediaAssets ?? [];
  const asset = layer.mediaId
    ? assets.find((a) => a.id === layer.mediaId)
    : layer.sourceUri
    ? assets.find((a) => a.uri === layer.sourceUri)
    : undefined;

  if (asset) {
    if (asset.status !== 'ready') {
      return {
        hasSource: false,
        uri: asset.uri,
        asset,
        status: asset.status,
        warning: asset.errorMessage ?? `Media asset "${asset.name}" is ${asset.status}.`,
      };
    }
    return {
      hasSource: true,
      uri: asset.uri,
      asset,
      status: 'ready',
    };
  }

  if (layer.sourceUri && layer.sourceUri.trim().length > 0) {
    return {
      hasSource: true,
      uri: layer.sourceUri.trim(),
      status: 'ready',
    };
  }

  return {
    hasSource: false,
    status: 'unassigned',
    warning: `Layer "${layer.name}" (${layer.kind}) has no assigned media source.`,
  };
}

export function evaluateSceneAtTime(project: MotionProject, timeMs?: number): EvaluatedScene {
  const evalTimeMs = clamp(
    timeMs !== undefined ? timeMs : project.currentTimeMs,
    0,
    project.durationMs
  );
  const fps = Math.max(1, project.fps || 30);
  const frameIndex = Math.round((evalTimeMs / 1000) * fps);
  const backgroundColor = project.backgroundColor ?? DEFAULT_BG_COLOR;

  const masterMuted = project.audioSettings?.muted ?? false;
  const masterVolume = clamp(project.audioSettings?.masterVolume ?? 1, 0, 2);

  const visualNodes: EvaluatedVisualNode[] = [];
  const audioNodes: EvaluatedAudioNode[] = [];
  const warnings: string[] = [];

  for (let i = project.layers.length - 1; i >= 0; i--) {
    const layer = project.layers[i];
    const state = evaluateLayerAtTime(layer, evalTimeMs);
    if (!state.active || !layer.visible) {
      continue;
    }

    const media = resolveLayerMedia(layer, project);
    if (media.warning) {
      warnings.push(media.warning);
    }

    if (layer.kind !== 'audio' && state.opacity > 0) {
      const defaultW = layer.kind === 'shape' ? 240 : layer.kind === 'text' ? 600 : 480;
      const defaultH = layer.kind === 'shape' ? 240 : layer.kind === 'text' ? 120 : 320;
      visualNodes.push({
        layerId: layer.id,
        name: layer.name,
        kind: layer.kind,
        paintOrder: visualNodes.length,
        timelineIndex: i,
        state,
        width: layer.width ?? media.asset?.width ?? defaultW,
        height: layer.height ?? media.asset?.height ?? defaultH,
        color: layer.color ?? (layer.kind === 'shape' ? '#8B7CFF' : '#FFFFFF'),
        text: layer.kind === 'text' ? layer.text || layer.name : undefined,
        fontSize: layer.kind === 'text' ? layer.fontSize ?? 56 : undefined,
        shape: layer.kind === 'shape' ? layer.shape ?? 'rectangle' : undefined,
        media: layer.kind === 'image' || layer.kind === 'video' ? media : undefined,
      });
    }

    if (layer.kind === 'audio' || layer.kind === 'video') {
      const hasAudioTrack =
        layer.kind === 'audio' || (media.asset ? media.asset.hasAudio !== false : true);
      if (hasAudioTrack) {
        const effectiveGain =
          masterMuted || layer.muted || !media.hasSource
            ? 0
            : clamp(state.volume * masterVolume, 0, 4);
        audioNodes.push({
          layerId: layer.id,
          name: layer.name,
          kind: layer.kind,
          timelineIndex: i,
          localTimeMs: state.localTimeMs,
          sourceTimeMs: state.sourceTimeMs,
          layerVolume: state.volume,
          effectiveGain,
          muted: Boolean(masterMuted || layer.muted),
          media,
        });
      }
    }
  }

  return {
    projectId: project.id,
    width: project.width,
    height: project.height,
    fps,
    durationMs: project.durationMs,
    timeMs: evalTimeMs,
    frameIndex,
    backgroundColor,
    visualNodes,
    audioNodes,
    warnings,
  };
}

export type PlaybackState = {
  isPlaying: boolean;
  loop: boolean;
  playbackRate: number;
};

export class PlaybackController {
  private state: PlaybackState = {
    isPlaying: false,
    loop: false,
    playbackRate: 1,
  };

  getState(): PlaybackState {
    return { ...this.state };
  }

  play(project: MotionProject): { project: MotionProject; state: PlaybackState } {
    const nextProject =
      project.currentTimeMs >= project.durationMs ? movePlayhead(project, 0) : project;
    this.state.isPlaying = true;
    return { project: nextProject, state: this.getState() };
  }

  pause(): PlaybackState {
    this.state.isPlaying = false;
    return this.getState();
  }

  toggleLoop(): PlaybackState {
    this.state.loop = !this.state.loop;
    return this.getState();
  }

  seek(project: MotionProject, timeMs: number): MotionProject {
    return movePlayhead(project, timeMs);
  }

  step(project: MotionProject, deltaFrames: number): MotionProject {
    this.state.isPlaying = false;
    return stepFrame(project, deltaFrames);
  }

  tick(project: MotionProject, elapsedWallMs: number): { project: MotionProject; state: PlaybackState } {
    if (!this.state.isPlaying) {
      return { project, state: this.getState() };
    }
    const deltaMs = Math.max(0, elapsedWallMs * this.state.playbackRate);
    const rawNext = project.currentTimeMs + deltaMs;
    if (rawNext >= project.durationMs) {
      if (this.state.loop) {
        const wrapped = project.durationMs > 0 ? rawNext % project.durationMs : 0;
        return { project: movePlayhead(project, wrapped), state: this.getState() };
      }
      this.state.isPlaying = false;
      return { project: movePlayhead(project, project.durationMs), state: this.getState() };
    }
    return { project: movePlayhead(project, rawNext), state: this.getState() };
  }
}
