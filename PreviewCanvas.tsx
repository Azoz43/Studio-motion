import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { EvaluatedScene } from '../core/preview';

export type PreviewCanvasProps = {
  scene: EvaluatedScene;
  viewportWidth?: number;
  viewportHeight?: number;
};

export function PreviewCanvas({
  scene,
  viewportWidth = 198,
  viewportHeight = 320,
}: PreviewCanvasProps) {
  const scaleX = viewportWidth / Math.max(1, scene.width);
  const scaleY = viewportHeight / Math.max(1, scene.height);
  const unitScale = Math.min(scaleX, scaleY);

  return (
    <View
      style={[
        styles.canvas,
        {
          width: viewportWidth,
          height: viewportHeight,
          backgroundColor: scene.backgroundColor || '#121629',
        },
      ]}
    >
      {scene.visualNodes.map((node) => {
        const { state } = node;
        const tx = state.x * scaleX;
        const ty = state.y * scaleY;
        const boxW = Math.max(24, Math.round(node.width * unitScale));
        const boxH = Math.max(24, Math.round(node.height * unitScale));
        const transform = [
          { translateX: tx },
          { translateY: ty },
          { scale: state.scale },
          { rotate: `${state.rotation}deg` },
        ];

        if (node.kind === 'text') {
          const scaledFont = Math.max(11, Math.round((node.fontSize ?? 56) * unitScale * 1.4));
          return (
            <Text
              key={node.layerId}
              numberOfLines={4}
              style={[
                styles.previewText,
                {
                  color: node.color || '#FFFFFF',
                  fontSize: scaledFont,
                  opacity: state.opacity,
                  transform,
                },
              ]}
            >
              {node.text || node.name}
            </Text>
          );
        }

        if (node.kind === 'shape') {
          const isCircle = node.shape === 'circle';
          const isRounded = node.shape === 'rounded';
          const borderRadius = isCircle ? Math.max(boxW, boxH) : isRounded ? 18 : 4;
          return (
            <View
              key={node.layerId}
              style={[
                styles.previewShape,
                {
                  width: boxW,
                  height: boxH,
                  backgroundColor: node.color || '#8B7CFF',
                  borderRadius,
                  opacity: state.opacity,
                  transform,
                },
              ]}
            />
          );
        }

        const hasValidMedia = node.media?.hasSource && node.media?.status === 'ready' && node.media?.uri;
        if (node.kind === 'image' && hasValidMedia) {
          return (
            <Image
              key={node.layerId}
              source={{ uri: node.media!.uri }}
              resizeMode="cover"
              style={[
                styles.mediaImage,
                {
                  width: boxW,
                  height: boxH,
                  opacity: state.opacity,
                  transform,
                },
              ]}
            />
          );
        }

        return (
          <View
            key={node.layerId}
            style={[
              styles.mediaBox,
              !hasValidMedia && styles.mediaBoxWarning,
              {
                width: boxW,
                height: boxH,
                opacity: state.opacity,
                transform,
              },
            ]}
          >
            <Text style={styles.mediaTitle}>
              {node.kind === 'image' ? '▧ IMAGE' : '▶ VIDEO'} · {node.name}
            </Text>
            <Text style={styles.mediaSubtitle} numberOfLines={2}>
              {hasValidMedia
                ? `${node.media?.uri?.split('/').pop()} @ ${(state.sourceTimeMs / 1000).toFixed(2)}s`
                : node.media?.warning || 'Media source not assigned'}
            </Text>
          </View>
        );
      })}

      {scene.visualNodes.length === 0 && (
        <Text style={styles.emptyText}>No active visual layers at {(scene.timeMs / 1000).toFixed(2)}s</Text>
      )}

      {scene.audioNodes.length > 0 && (
        <View style={styles.audioBadge}>
          <Text style={styles.audioBadgeText}>
            ♪ {scene.audioNodes.length} active audio track(s)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    borderColor: '#474D68',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 10,
  },
  previewText: {
    fontWeight: '900',
    position: 'absolute',
    textAlign: 'center',
  },
  previewShape: {
    position: 'absolute',
  },
  mediaImage: {
    position: 'absolute',
    borderRadius: 6,
  },
  mediaBox: {
    position: 'absolute',
    backgroundColor: '#25314D',
    borderWidth: 1,
    borderColor: '#6E85B7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  mediaBoxWarning: {
    backgroundColor: '#3B2632',
    borderColor: '#E06C88',
  },
  mediaTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
  },
  mediaSubtitle: {
    color: '#D0D7E6',
    fontSize: 8,
    marginTop: 3,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9AA4B6',
    fontSize: 11,
  },
  audioBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(15, 20, 32, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7CFF',
  },
  audioBadgeText: {
    color: '#DAD5FF',
    fontSize: 9,
    fontWeight: '700',
  },
});
