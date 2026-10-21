import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeProject, serializeProject, validateProject } from '../src/core/project';
import {
  addLayer,
  addMediaLayer,
  addPropertyKeyframe,
  clamp,
  duplicateLayer,
  moveLayerOrder,
  movePlayhead,
  removeKeyframe,
  removeLayer,
  splitLayerAtTime,
  stepFrame,
  trimLayer,
  updateKeyframeEasing,
} from '../src/core/timeline';
import { evaluateSceneAtTime } from '../src/core/preview';
import { PreviewCanvas } from '../src/components/PreviewCanvas';
import { ProjectStorageManager } from '../src/storage/projectStorage';
import { getAndroidNativeMediaModule } from '../src/media/nativeAndroidBridge';
import { validateSafeUri } from '../src/security/validation';
import type {
  AnimatedProperty,
  EasingMode,
  Layer,
  LayerKind,
  MediaAsset,
  MotionProject,
  ShapeKind,
} from '../src/core/model';

const BG = '#0B0D12',
  PANEL = '#151923',
  PANEL2 = '#202635',
  ACCENT = '#8B7CFF',
  TEXT = '#F2F4F8',
  MUTED = '#9AA4B6';

const kinds: LayerKind[] = ['text', 'shape', 'image', 'video', 'audio'];
const animatableProps: AnimatedProperty[] = ['opacity', 'x', 'y', 'scale', 'rotation', 'volume'];
const easingModes: EasingMode[] = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'cubicBezier', 'step'];
const shapeKinds: ShapeKind[] = ['rectangle', 'circle', 'rounded', 'triangle'];

const storageManager = new ProjectStorageManager(AsyncStorage);

export default function EditorScreen() {
  const [project, setProject] = useState<MotionProject>(() => makeProject());
  const [selectedId, setSelectedId] = useState(project.layers[0]?.id ?? '');
  const [selectedEasing, setSelectedEasing] = useState<EasingMode>('linear');
  const [jsonInput, setJsonInput] = useState('');
  const [mediaUriInput, setMediaUriInput] = useState('');
  const [mediaKindInput, setMediaKindInput] = useState<'image' | 'video' | 'audio'>('image');
  const [showImport, setShowImport] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopPlayback, setLoopPlayback] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    running: boolean;
    percent: number;
    stage: string;
    lastOutput?: string;
    error?: string;
  }>({ running: false, percent: 0, stage: 'idle' });
  const exportAbortRef = useRef<AbortController | null>(null);

  // Restore last opened project on startup (P0 requirement: reopen project after closing app)
  useEffect(() => {
    let mounted = true;
    storageManager
      .loadLastOpenedProject()
      .then((res) => {
        if (mounted && res?.project) {
          setProject(res.project);
          setSelectedId(res.project.layers[0]?.id ?? '');
        }
      })
      .catch(() => {
        // Fallback to initial blank project if storage is empty
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selected = project.layers.find((l) => l.id === selectedId) ?? project.layers[0];
  const timeLabel = useMemo(
    () => `${(project.currentTimeMs / 1000).toFixed(2)}s`,
    [project.currentTimeMs]
  );

  const evaluatedScene = useMemo(
    () => evaluateSceneAtTime(project, project.currentTimeMs),
    [project]
  );

  // Playback timer synced to project FPS
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(16, Math.round(1000 / Math.max(1, project.fps)));
    const startedAt = Date.now();
    const startTime = project.currentTimeMs;
    const timer = setInterval(() => {
      const nextTime = startTime + (Date.now() - startedAt);
      if (nextTime >= project.durationMs) {
        if (loopPlayback) {
          setProject((p) => movePlayhead(p, nextTime % Math.max(1, p.durationMs)));
        } else {
          setProject((p) => movePlayhead(p, p.durationMs));
          setIsPlaying(false);
        }
      } else {
        setProject((p) => movePlayhead(p, nextTime));
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, loopPlayback, project.durationMs, project.fps]);

  const updateLayer = (patch: Partial<Layer>) => {
    if (!selected || selected.locked) return;
    setProject((p) => ({
      ...p,
      updatedAt: new Date().toISOString(),
      layers: p.layers.map((l) => (l.id === selected.id ? { ...l, ...patch } : l)),
    }));
  };

  const persist = async () => {
    try {
      const result = await storageManager.saveProject(project);
      Alert.alert(
        'Saved',
        `Project saved atomically (${result.backedUpPrevious ? 'previous version backed up' : 'initial save'}).`
      );
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not save project.');
    }
  };

  const exportProjectJson = async () => {
    try {
      await Share.share({ title: `${project.name}.json`, message: serializeProject(project) });
    } catch {
      Alert.alert('Export failed', 'Could not open the share sheet.');
    }
  };

  const importProjectJson = () => {
    try {
      const p = validateProject(JSON.parse(jsonInput));
      setProject(p);
      setSelectedId(p.layers[0]?.id ?? '');
      setShowImport(false);
      setJsonInput('');
    } catch (e) {
      Alert.alert('Invalid project', e instanceof Error ? e.message : 'Could not read project JSON.');
    }
  };

  const handleImportMediaAsset = async () => {
    const uri = mediaUriInput.trim();
    const check = validateSafeUri(uri);
    if (!check.safe) {
      Alert.alert('Invalid Media URI', check.reason ?? 'Unsafe file URI.');
      return;
    }

    const nativeModule = getAndroidNativeMediaModule();
    let probed: any = {};
    if (nativeModule) {
      try {
        probed = await nativeModule.probeMedia(uri);
      } catch (e) {
        Alert.alert('Media Probe Error', e instanceof Error ? e.message : 'Could not read media.');
        return;
      }
    }

    const asset: MediaAsset = {
      id: `media-${Date.now().toString(36)}`,
      name: uri.split('/').pop() || `${mediaKindInput}-asset`,
      kind: mediaKindInput,
      uri,
      mimeType:
        probed.mimeType ??
        (mediaKindInput === 'image'
          ? 'image/png'
          : mediaKindInput === 'video'
          ? 'video/mp4'
          : 'audio/mp4'),
      sizeBytes: 0,
      width: probed.width ?? (mediaKindInput === 'audio' ? undefined : 640),
      height: probed.height ?? (mediaKindInput === 'audio' ? undefined : 360),
      durationMs:
        probed.durationMs ?? (mediaKindInput === 'image' ? undefined : project.durationMs),
      fps: probed.fps ?? 30,
      hasAudio: mediaKindInput !== 'image',
      status: 'ready',
    };

    const next = addMediaLayer(project, asset);
    setProject(next);
    setSelectedId(next.layers[next.layers.length - 1].id);
    setMediaUriInput('');
    setShowMediaModal(false);
  };

  const handleExportMp4 = async () => {
    if (exportStatus.running) return;
    const abortCtrl = new AbortController();
    exportAbortRef.current = abortCtrl;
    setExportStatus({ running: true, percent: 5, stage: 'preparing' });

    try {
      const nativeModule = getAndroidNativeMediaModule();
      const outputName = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'motion_studio'}_${Date.now()}.mp4`;
      if (nativeModule) {
        const res = await nativeModule.exportProjectMp4(serializeProject(project), outputName);
        setExportStatus({
          running: false,
          percent: 100,
          stage: 'completed',
          lastOutput: res.outputPath,
        });
        Alert.alert('MP4 Export Complete', `Saved to: ${res.outputPath} (${res.sizeBytes} bytes)`);
      } else {
        setExportStatus({
          running: false,
          percent: 0,
          stage: 'idle',
          error: 'Native Android MediaCodec module requires a compiled Android development build (APK).',
        });
        Alert.alert(
          'Export Ready for Native Build',
          'In Android APK runtime, MotionStudioMediaModule encodes H.264/AAC via MediaCodec/MediaMuxer. In Node/CLI, run the exporter pipeline.'
        );
      }
    } catch (e) {
      setExportStatus({
        running: false,
        percent: 0,
        stage: 'error',
        error: e instanceof Error ? e.message : 'Export failed.',
      });
    } finally {
      exportAbortRef.current = null;
    }
  };

  const handleCancelExport = async () => {
    exportAbortRef.current?.abort();
    const nativeModule = getAndroidNativeMediaModule();
    if (nativeModule) {
      await nativeModule.cancelActiveExport().catch(() => false);
    }
    setExportStatus({ running: false, percent: 0, stage: 'cancelled' });
  };

  const add = (kind: LayerKind) => {
    const next = addLayer(project, kind);
    setProject(next);
    setSelectedId(next.layers[next.layers.length - 1].id);
  };

  const addKeyframe = (property: AnimatedProperty) => {
    if (!selected || selected.locked) return;
    const localTimeMs = clamp(project.currentTimeMs - selected.startMs, 0, selected.durationMs);
    const updated = addPropertyKeyframe(selected, localTimeMs, property, undefined, selectedEasing);
    setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === selected.id ? updated : l)),
    }));
  };

  const toggleVisibility = (layer: Layer) =>
    setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l)),
    }));

  const toggleLock = (layer: Layer) =>
    setProject((p) => ({
      ...p,
      layers: p.layers.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l)),
    }));

  const changeTime = (delta: number) =>
    setProject((p) => movePlayhead(p, p.currentTimeMs + delta));

  return (
    <View style={s.root}>
      <View style={s.topbar}>
        <View>
          <Text style={s.brand}>MOTION STUDIO v4</Text>
          <Text style={s.projectName}>{project.name}</Text>
        </View>
        <View style={s.topActions}>
          <TouchableOpacity style={s.smallBtn} onPress={persist}>
            <Text style={s.smallBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.smallBtn} onPress={exportProjectJson}>
            <Text style={s.smallBtnText}>Share JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.smallBtn, { backgroundColor: ACCENT }]} onPress={handleExportMp4}>
            <Text style={s.smallBtnText}>Export MP4</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* PREVIEW PANEL */}
        <View style={s.previewPanel}>
          <View style={s.previewHeader}>
            <Text style={s.sectionTitle}>PREVIEW</Text>
            <Text style={s.meta}>
              {project.width} × {project.height} · {project.fps} FPS · Frame #{evaluatedScene.frameIndex}
            </Text>
          </View>
          <View style={s.canvasOuter}>
            <PreviewCanvas scene={evaluatedScene} />
          </View>
          <View style={s.playheadRow}>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                setProject((p) => movePlayhead(p, 0));
              }}
            >
              <Text style={s.transportText}>|◀</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                setProject((p) => stepFrame(p, -1));
              }}
            >
              <Text style={s.transportText}>−1f</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                changeTime(-100);
              }}
            >
              <Text style={s.transportText}>−100ms</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.transport, isPlaying && { backgroundColor: ACCENT }]}
              onPress={() => {
                if (project.currentTimeMs >= project.durationMs)
                  setProject((p) => movePlayhead(p, 0));
                setIsPlaying((v) => !v);
              }}
            >
              <Text style={s.transportText}>{isPlaying ? '❚❚' : '▶'}</Text>
            </TouchableOpacity>
            <Text style={s.time}>{timeLabel}</Text>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                changeTime(100);
              }}
            >
              <Text style={s.transportText}>+100ms</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                setProject((p) => stepFrame(p, 1));
              }}
            >
              <Text style={s.transportText}>+1f</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.transport, loopPlayback && { borderColor: ACCENT, borderWidth: 1 }]}
              onPress={() => setLoopPlayback((v) => !v)}
            >
              <Text style={s.transportText}>↻</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.transport}
              onPress={() => {
                setIsPlaying(false);
                setProject((p) => movePlayhead(p, p.durationMs));
              }}
            >
              <Text style={s.transportText}>▶|</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TIMELINE PANEL */}
        <View style={s.panel}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>TIMELINE · {project.layers.length} LAYERS</Text>
            <Text style={s.meta}>{(project.durationMs / 1000).toFixed(1)}s</Text>
          </View>
          <View style={s.ruler}>
            <Text style={s.rulerText}>0s</Text>
            <Text style={s.rulerText}>{(project.durationMs / 4000).toFixed(1)}s</Text>
            <Text style={s.rulerText}>{(project.durationMs / 2000).toFixed(1)}s</Text>
            <Text style={s.rulerText}>{((project.durationMs * 3) / 4000).toFixed(1)}s</Text>
            <Text style={s.rulerText}>{(project.durationMs / 1000).toFixed(1)}s</Text>
          </View>
          {project.layers.map((layer, index) => (
            <TouchableOpacity
              key={layer.id}
              onPress={() => setSelectedId(layer.id)}
              style={[s.layerRow, selected?.id === layer.id && s.layerSelected]}
            >
              <View style={s.layerMeta}>
                <Text style={s.layerIndex}>{String(index + 1).padStart(2, '0')}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.layerName}>
                    {layer.name} {layer.locked ? '🔒' : ''}
                  </Text>
                  <Text style={s.layerKind}>
                    {layer.kind.toUpperCase()} · {(layer.startMs / 1000).toFixed(1)}s–
                    {((layer.startMs + layer.durationMs) / 1000).toFixed(1)}s
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleLock(layer)}>
                  <Text style={s.eye}>{layer.locked ? '🔒' : '🔓'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleVisibility(layer)}>
                  <Text style={s.eye}>{layer.visible ? '◉' : '○'}</Text>
                </TouchableOpacity>
              </View>
              <View style={s.track}>
                <View
                  style={[
                    s.clip,
                    layer.kind === 'audio' && { backgroundColor: '#2E9B78' },
                    {
                      left: `${(layer.startMs / Math.max(1, project.durationMs)) * 100}%`,
                      width: `${(layer.durationMs / Math.max(1, project.durationMs)) * 100}%`,
                    },
                  ]}
                >
                  {layer.keyframes.map((k) => (
                    <View
                      key={k.id}
                      style={[
                        s.diamond,
                        { left: `${(k.timeMs / Math.max(layer.durationMs, 1)) * 100}%` },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={s.addRow}>
            {kinds.map((k) => (
              <TouchableOpacity key={k} style={s.addBtn} onPress={() => add(k)}>
                <Text style={s.addBtnText}>＋ {k}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[s.addBtn, { backgroundColor: '#2A3B5C' }]}
              onPress={() => setShowMediaModal((v) => !v)}
            >
              <Text style={s.addBtnText}>📥 Import Media File</Text>
            </TouchableOpacity>
          </View>
          {showMediaModal && (
            <View style={{ gap: 8, marginTop: 6 }}>
              <View style={s.addRow}>
                {(['image', 'video', 'audio'] as const).map((mk) => (
                  <TouchableOpacity
                    key={mk}
                    style={[s.addBtn, mediaKindInput === mk && { backgroundColor: ACCENT }]}
                    onPress={() => setMediaKindInput(mk)}
                  >
                    <Text style={s.addBtnText}>{mk.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                value={mediaUriInput}
                onChangeText={setMediaUriInput}
                placeholder="file:///path/to/media.mp4 or content://..."
                placeholderTextColor={MUTED}
                style={s.input}
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.primaryBtn} onPress={handleImportMediaAsset}>
                <Text style={s.primaryText}>Validate & Add Media Layer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LAYER PROPERTIES & TIMELINE TRIMMING */}
        {selected && (
          <View style={s.panel}>
            <View style={s.rowBetween}>
              <Text style={s.sectionTitle}>LAYER PROPERTIES · {selected.kind.toUpperCase()}</Text>
              <View style={s.addRow}>
                <TouchableOpacity
                  style={s.smallBtn}
                  onPress={() => setProject((p) => moveLayerOrder(p, selected.id, 'up'))}
                >
                  <Text style={s.smallBtnText}>↑ Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.smallBtn}
                  onPress={() => setProject((p) => moveLayerOrder(p, selected.id, 'down'))}
                >
                  <Text style={s.smallBtnText}>↓ Down</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.smallBtn}
                  onPress={() => setProject((p) => duplicateLayer(p, selected.id))}
                >
                  <Text style={s.smallBtnText}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.smallBtn}
                  onPress={() =>
                    setProject((p) => splitLayerAtTime(p, selected.id, p.currentTimeMs))
                  }
                >
                  <Text style={s.smallBtnText}>✂ Split</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.smallBtn, { backgroundColor: '#48232E' }]}
                  onPress={() => setProject((p) => removeLayer(p, selected.id))}
                >
                  <Text style={[s.smallBtnText, { color: '#FF8C9D' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={s.label}>Layer name</Text>
            <TextInput
              value={selected.name}
              onChangeText={(name) => updateLayer({ name })}
              style={s.input}
              placeholderTextColor={MUTED}
            />

            {/* Trim Start & Duration */}
            <View style={s.rowBetween}>
              <Text style={s.label}>Start Offset</Text>
              <Text style={s.value}>{(selected.startMs / 1000).toFixed(2)}s</Text>
            </View>
            <View style={s.sliderRow}>
              <TouchableOpacity
                style={s.adjust}
                onPress={() =>
                  updateLayer(
                    trimLayer(
                      selected,
                      selected.startMs - 250,
                      selected.durationMs,
                      selected.inPointMs,
                      project.durationMs
                    )
                  )
                }
              >
                <Text style={s.adjustText}>−</Text>
              </TouchableOpacity>
              <View style={s.fakeSlider}>
                <View
                  style={[
                    s.fakeFill,
                    { width: `${(selected.startMs / Math.max(1, project.durationMs)) * 100}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={s.adjust}
                onPress={() =>
                  updateLayer(
                    trimLayer(
                      selected,
                      selected.startMs + 250,
                      selected.durationMs,
                      selected.inPointMs,
                      project.durationMs
                    )
                  )
                }
              >
                <Text style={s.adjustText}>＋</Text>
              </TouchableOpacity>
            </View>

            <View style={s.rowBetween}>
              <Text style={s.label}>Clip Duration</Text>
              <Text style={s.value}>{(selected.durationMs / 1000).toFixed(2)}s</Text>
            </View>
            <View style={s.sliderRow}>
              <TouchableOpacity
                style={s.adjust}
                onPress={() =>
                  updateLayer(
                    trimLayer(
                      selected,
                      selected.startMs,
                      selected.durationMs - 250,
                      selected.inPointMs,
                      project.durationMs
                    )
                  )
                }
              >
                <Text style={s.adjustText}>−</Text>
              </TouchableOpacity>
              <View style={s.fakeSlider}>
                <View
                  style={[
                    s.fakeFill,
                    { width: `${(selected.durationMs / Math.max(1, project.durationMs)) * 100}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={s.adjust}
                onPress={() =>
                  updateLayer(
                    trimLayer(
                      selected,
                      selected.startMs,
                      selected.durationMs + 250,
                      selected.inPointMs,
                      project.durationMs
                    )
                  )
                }
              >
                <Text style={s.adjustText}>＋</Text>
              </TouchableOpacity>
            </View>

            {selected.kind === 'text' && (
              <>
                <Text style={s.label}>Text content</Text>
                <TextInput
                  value={selected.text ?? ''}
                  onChangeText={(text) => updateLayer({ text })}
                  style={s.input}
                  placeholder="Enter text"
                  placeholderTextColor={MUTED}
                />
              </>
            )}

            {(selected.kind === 'text' || selected.kind === 'shape') && (
              <>
                <Text style={s.label}>Color (hex)</Text>
                <TextInput
                  value={selected.color ?? '#FFFFFF'}
                  onChangeText={(color) =>
                    updateLayer({ color: color.startsWith('#') ? color : `#${color}` })
                  }
                  style={s.input}
                  autoCapitalize="characters"
                  placeholder="#FFFFFF"
                  placeholderTextColor={MUTED}
                />
                {selected.kind === 'shape' && (
                  <View style={s.addRow}>
                    {shapeKinds.map((sk) => (
                      <TouchableOpacity
                        key={sk}
                        style={[s.addBtn, selected.shape === sk && { backgroundColor: ACCENT }]}
                        onPress={() => updateLayer({ shape: sk })}
                      >
                        <Text style={s.addBtnText}>{sk}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}

            {(selected.kind === 'video' || selected.kind === 'audio') && (
              <>
                <View style={s.rowBetween}>
                  <Text style={s.label}>Audio Volume</Text>
                  <TouchableOpacity onPress={() => updateLayer({ muted: !selected.muted })}>
                    <Text style={s.value}>
                      {selected.muted ? 'MUTED 🔇' : `${Math.round((selected.volume ?? 1) * 100)}% 🔊`}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={s.sliderRow}>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() =>
                      updateLayer({ volume: clamp((selected.volume ?? 1) - 0.1, 0, 2) })
                    }
                  >
                    <Text style={s.adjustText}>−</Text>
                  </TouchableOpacity>
                  <View style={s.fakeSlider}>
                    <View style={[s.fakeFill, { width: `${((selected.volume ?? 1) / 2) * 100}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() =>
                      updateLayer({ volume: clamp((selected.volume ?? 1) + 0.1, 0, 2) })
                    }
                  >
                    <Text style={s.adjustText}>＋</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {selected.kind !== 'audio' && (
              <>
                <View style={s.rowBetween}>
                  <Text style={s.label}>Opacity</Text>
                  <Text style={s.value}>{Math.round(selected.opacity * 100)}%</Text>
                </View>
                <View style={s.sliderRow}>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ opacity: clamp(selected.opacity - 0.1, 0, 1) })}
                  >
                    <Text style={s.adjustText}>−</Text>
                  </TouchableOpacity>
                  <View style={s.fakeSlider}>
                    <View style={[s.fakeFill, { width: `${selected.opacity * 100}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ opacity: clamp(selected.opacity + 0.1, 0, 1) })}
                  >
                    <Text style={s.adjustText}>＋</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.rowBetween}>
                  <Text style={s.label}>Scale</Text>
                  <Text style={s.value}>{selected.scale.toFixed(1)}×</Text>
                </View>
                <View style={s.sliderRow}>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ scale: clamp(selected.scale - 0.1, 0.1, 5) })}
                  >
                    <Text style={s.adjustText}>−</Text>
                  </TouchableOpacity>
                  <View style={s.fakeSlider}>
                    <View style={[s.fakeFill, { width: `${(selected.scale / 5) * 100}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ scale: clamp(selected.scale + 0.1, 0.1, 5) })}
                  >
                    <Text style={s.adjustText}>＋</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.rowBetween}>
                  <Text style={s.label}>Position X</Text>
                  <Text style={s.value}>{Math.round(selected.x)} px</Text>
                </View>
                <View style={s.sliderRow}>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ x: clamp(selected.x - 10, -1000, 1000) })}
                  >
                    <Text style={s.adjustText}>−</Text>
                  </TouchableOpacity>
                  <View style={s.fakeSlider}>
                    <View style={[s.fakeFill, { width: `${(selected.x + 1000) / 20}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ x: clamp(selected.x + 10, -1000, 1000) })}
                  >
                    <Text style={s.adjustText}>＋</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.rowBetween}>
                  <Text style={s.label}>Position Y</Text>
                  <Text style={s.value}>{Math.round(selected.y)} px</Text>
                </View>
                <View style={s.sliderRow}>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ y: clamp(selected.y - 10, -1000, 1000) })}
                  >
                    <Text style={s.adjustText}>−</Text>
                  </TouchableOpacity>
                  <View style={s.fakeSlider}>
                    <View style={[s.fakeFill, { width: `${(selected.y + 1000) / 20}%` }]} />
                  </View>
                  <TouchableOpacity
                    style={s.adjust}
                    onPress={() => updateLayer({ y: clamp(selected.y + 10, -1000, 1000) })}
                  >
                    <Text style={s.adjustText}>＋</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.rowBetween}>
                  <Text style={s.label}>Rotation</Text>
                  <View style={s.addRow}>
                    <TouchableOpacity
                      style={s.adjust}
                      onPress={() => updateLayer({ rotation: (selected.rotation ?? 0) - 5 })}
                    >
                      <Text style={s.adjustText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.value}>{selected.rotation ?? 0}°</Text>
                    <TouchableOpacity
                      style={s.adjust}
                      onPress={() => updateLayer({ rotation: (selected.rotation ?? 0) + 5 })}
                    >
                      <Text style={s.adjustText}>＋</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <Text style={s.label}>Keyframe Easing Mode</Text>
            <View style={s.addRow}>
              {easingModes.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[s.addBtn, selectedEasing === em && { backgroundColor: ACCENT }]}
                  onPress={() => setSelectedEasing(em)}
                >
                  <Text style={s.addBtnText}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Add keyframe at {timeLabel} ({selectedEasing})</Text>
            <View style={s.addRow}>
              {animatableProps.map((property) => (
                <TouchableOpacity
                  key={property}
                  style={s.keyBtn}
                  onPress={() => addKeyframe(property)}
                >
                  <Text style={s.keyBtnText}>＋ {property}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.hint}>
              {selected.keyframes.length} keyframes · Supports opacity, X, Y, scale, rotation & volume with Linear, Ease & Cubic-Bezier interpolation.
            </Text>
          </View>
        )}

        {/* PROJECT & EXPORT SETTINGS */}
        <View style={s.panel}>
          <View style={s.rowBetween}>
            <Text style={s.sectionTitle}>PROJECT & EXPORT SETTINGS</Text>
            <TouchableOpacity
              onPress={() => {
                const fresh = makeProject();
                setProject(fresh);
                setSelectedId(fresh.layers[0]?.id ?? '');
              }}
            >
              <Text style={s.danger}>New project</Text>
            </TouchableOpacity>
          </View>
          <View style={s.addRow}>
            {[
              { label: '720p Vertical', w: 720, h: 1280 },
              { label: '1080p Vertical', w: 1080, h: 1920 },
              { label: '1080p Landscape', w: 1920, h: 1080 },
            ].map((preset) => (
              <TouchableOpacity
                key={preset.label}
                style={[
                  s.addBtn,
                  project.width === preset.w && project.height === preset.h && { backgroundColor: ACCENT },
                ]}
                onPress={() =>
                  setProject((p) => ({
                    ...p,
                    width: preset.w,
                    height: preset.h,
                    exportSettings: { ...(p.exportSettings ?? ({} as any)), width: preset.w, height: preset.h },
                  }))
                }
              >
                <Text style={s.addBtnText}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.addRow}>
            {[24, 30, 60].map((fpsOpt) => (
              <TouchableOpacity
                key={fpsOpt}
                style={[s.addBtn, project.fps === fpsOpt && { backgroundColor: ACCENT }]}
                onPress={() =>
                  setProject((p) => ({
                    ...p,
                    fps: fpsOpt,
                    exportSettings: { ...(p.exportSettings ?? ({} as any)), fps: fpsOpt },
                  }))
                }
              >
                <Text style={s.addBtnText}>{fpsOpt} FPS</Text>
              </TouchableOpacity>
            ))}
          </View>

          {exportStatus.running && (
            <View style={{ gap: 6 }}>
              <Text style={s.label}>
                Exporting MP4 ({exportStatus.stage}) · {exportStatus.percent}%
              </Text>
              <TouchableOpacity style={s.secondaryBtn} onPress={handleCancelExport}>
                <Text style={[s.secondaryBtnText, { color: '#FF8C9D' }]}>Cancel Export</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={s.secondaryBtn} onPress={() => setShowImport((v) => !v)}>
            <Text style={s.secondaryBtnText}>
              {showImport ? 'Cancel JSON import' : 'Import project JSON (v1 or v2)'}
            </Text>
          </TouchableOpacity>
          {showImport && (
            <>
              <TextInput
                multiline
                value={jsonInput}
                onChangeText={setJsonInput}
                placeholder="Paste a Motion Studio project JSON here"
                placeholderTextColor={MUTED}
                style={[s.input, s.jsonInput]}
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.primaryBtn} onPress={importProjectJson}>
                <Text style={s.primaryText}>Validate & import</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={s.footer}>
          Motion Studio v4 · Clean-room independent engine · Schema v2 (v1 compatible)
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topbar: {
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242A38',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: ACCENT, fontSize: 10, letterSpacing: 2, fontWeight: '900' },
  projectName: { color: TEXT, fontSize: 18, fontWeight: '800', marginTop: 4 },
  topActions: { flexDirection: 'row', gap: 6 },
  smallBtn: { backgroundColor: PANEL2, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9 },
  smallBtnText: { color: TEXT, fontSize: 11, fontWeight: '700' },
  content: { padding: 14, gap: 12, paddingBottom: 40 },
  previewPanel: { backgroundColor: PANEL, borderRadius: 16, padding: 12 },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { color: TEXT, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  meta: { color: MUTED, fontSize: 10 },
  canvasOuter: { alignItems: 'center', paddingVertical: 4 },
  playheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 4,
  },
  transport: { padding: 7, backgroundColor: PANEL2, borderRadius: 8 },
  transportText: { color: TEXT, fontSize: 10, fontWeight: '700' },
  time: { color: ACCENT, fontWeight: '900', fontVariant: ['tabular-nums'] },
  panel: { backgroundColor: PANEL, borderRadius: 16, padding: 13, gap: 10 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  ruler: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    paddingRight: 4,
    marginTop: 3,
  },
  rulerText: { color: MUTED, fontSize: 9 },
  layerRow: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#11151E',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8,
  },
  layerSelected: { borderColor: ACCENT, backgroundColor: '#1A1A2A' },
  layerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  layerIndex: { color: ACCENT, fontSize: 10, fontWeight: '900' },
  layerName: { color: TEXT, fontSize: 12, fontWeight: '700' },
  layerKind: { color: MUTED, fontSize: 8, marginTop: 2 },
  eye: { color: TEXT, fontSize: 15, paddingHorizontal: 4 },
  track: {
    height: 18,
    backgroundColor: '#252B3A',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  clip: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 4,
    backgroundColor: '#7567E8',
    minWidth: 5,
  },
  diamond: {
    width: 7,
    height: 7,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 3,
    marginLeft: -3,
    transform: [{ rotate: '45deg' }],
  },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: PANEL2, borderRadius: 9 },
  addBtnText: { color: TEXT, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  label: { color: MUTED, fontSize: 11, fontWeight: '700' },
  value: { color: ACCENT, fontSize: 12, fontWeight: '900' },
  input: {
    backgroundColor: '#0D1119',
    color: TEXT,
    borderWidth: 1,
    borderColor: '#303748',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 12,
  },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adjust: {
    backgroundColor: PANEL2,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  adjustText: { color: TEXT, fontWeight: '900', fontSize: 18 },
  fakeSlider: {
    height: 6,
    flex: 1,
    backgroundColor: '#303748',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fakeFill: { height: 6, backgroundColor: ACCENT, borderRadius: 4 },
  keyBtn: { backgroundColor: '#312A55', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  keyBtnText: { color: '#DAD5FF', fontSize: 10, fontWeight: '800' },
  hint: { color: MUTED, fontSize: 10, lineHeight: 16 },
  secondaryBtn: { backgroundColor: PANEL2, padding: 11, borderRadius: 9, alignItems: 'center' },
  secondaryBtnText: { color: TEXT, fontSize: 11, fontWeight: '800' },
  primaryBtn: { backgroundColor: ACCENT, padding: 11, borderRadius: 9, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 11 },
  jsonInput: { minHeight: 120, textAlignVertical: 'top', fontFamily: 'monospace' },
  danger: { color: '#FF8C9D', fontSize: 10, fontWeight: '800' },
  footer: { textAlign: 'center', color: '#5E6678', fontSize: 9, paddingVertical: 5 },
});
