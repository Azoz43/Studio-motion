import type { EvaluatedScene, EvaluatedVisualNode } from '../core/preview';
import { clamp } from '../core/timeline';

export type RgbaColor = [number, number, number, number];

export type DecodedRgbaImage = {
  width: number;
  height: number;
  data: Uint8Array;
};

export function parseHexColor(hex: string, defaultColor: RgbaColor = [18, 22, 41, 255]): RgbaColor {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return defaultColor;
  const clean = hex.slice(1).trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return defaultColor;
    return [r, g, b, 255];
  }
  if (clean.length === 6 || clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) : 255;
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) || Number.isNaN(a)) return defaultColor;
    return [r, g, b, a];
  }
  return defaultColor;
}

const GLYPH_5X7: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11100, 0b10010, 0b10001, 0b10001, 0b10001, 0b10010, 0b11100],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10111, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b10010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01101],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010],
  X: [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111],
  '0': [0b01110, 0b10001, 0b10011, 0b10101, 0b11001, 0b10001, 0b01110],
  '1': [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110],
  '2': [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111],
  '3': [0b11110, 0b00001, 0b00001, 0b01110, 0b00001, 0b00001, 0b11110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '5': [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110],
  '6': [0b01110, 0b10000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110],
  '7': [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b01000, 0b01000],
  '8': [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110],
  '9': [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00001, 0b01110],
  '-': [0b00000, 0b00000, 0b00000, 0b11111, 0b00000, 0b00000, 0b00000],
  '.': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b01100, 0b01100],
  ':': [0b00000, 0b01100, 0b01100, 0b00000, 0b01100, 0b01100, 0b00000],
  '!': [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100],
  ' ': [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
};

function blendPixel(
  buf: Uint8Array,
  idx: number,
  r: number,
  g: number,
  b: number,
  alpha01: number
): void {
  const a = clamp(alpha01, 0, 1);
  if (a <= 0) return;
  if (a >= 0.999) {
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = 255;
    return;
  }
  const invA = 1 - a;
  buf[idx] = Math.round(r * a + buf[idx] * invA);
  buf[idx + 1] = Math.round(g * a + buf[idx + 1] * invA);
  buf[idx + 2] = Math.round(b * a + buf[idx + 2] * invA);
  buf[idx + 3] = 255;
}

function insideShape(
  localX: number,
  localY: number,
  halfW: number,
  halfH: number,
  shape: EvaluatedVisualNode['shape']
): boolean {
  if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) return false;
  if (shape === 'circle') {
    const nx = localX / Math.max(1, halfW);
    const ny = localY / Math.max(1, halfH);
    return nx * nx + ny * ny <= 1;
  }
  if (shape === 'triangle') {
    const normY = (localY + halfH) / Math.max(1, 2 * halfH);
    const maxAbsX = normY * halfW;
    return Math.abs(localX) <= maxAbsX;
  }
  if (shape === 'rounded') {
    const cornerRadius = Math.min(halfW, halfH) * 0.25;
    const qx = Math.abs(localX) - (halfW - cornerRadius);
    const qy = Math.abs(localY) - (halfH - cornerRadius);
    if (qx > 0 && qy > 0) {
      return qx * qx + qy * qy <= cornerRadius * cornerRadius;
    }
    return true;
  }
  return true;
}

function sampleTextGlyph(text: string, localX: number, localY: number, fontSize: number): boolean {
  const clean = (text || 'TEXT').toUpperCase().slice(0, 32);
  const pixelScale = Math.max(2, Math.round(fontSize / 7));
  const glyphW = 5 * pixelScale;
  const glyphH = 7 * pixelScale;
  const gap = Math.max(2, Math.round(pixelScale * 1.2));
  const totalW = clean.length * glyphW + Math.max(0, clean.length - 1) * gap;

  const relX = localX + totalW / 2;
  const relY = localY + glyphH / 2;
  if (relX < 0 || relX >= totalW || relY < 0 || relY >= glyphH) return false;

  const stride = glyphW + gap;
  const charIdx = Math.floor(relX / stride);
  if (charIdx < 0 || charIdx >= clean.length) return false;

  const inCharX = relX - charIdx * stride;
  if (inCharX >= glyphW) return false;

  const col = Math.floor(inCharX / pixelScale);
  const row = Math.floor(relY / pixelScale);
  if (col < 0 || col >= 5 || row < 0 || row >= 7) return false;

  const ch = clean[charIdx];
  const pattern = GLYPH_5X7[ch] ?? GLYPH_5X7['O'];
  const rowBits = pattern[row] ?? 0;
  return ((rowBits >> (4 - col)) & 1) === 1;
}

export function renderSceneToRgba(
  scene: EvaluatedScene,
  decodedMediaMap: Map<string, DecodedRgbaImage> = new Map(),
  targetBuffer?: Uint8Array
): Uint8Array {
  const { width, height } = scene;
  const totalBytes = width * height * 4;
  const buf =
    targetBuffer && targetBuffer.byteLength === totalBytes
      ? targetBuffer
      : new Uint8Array(totalBytes);

  const [bgR, bgG, bgB, bgA] = parseHexColor(scene.backgroundColor);
  for (let i = 0; i < totalBytes; i += 4) {
    buf[i] = bgR;
    buf[i + 1] = bgG;
    buf[i + 2] = bgB;
    buf[i + 3] = bgA;
  }

  const canvasCenterX = width * 0.5;
  const canvasCenterY = height * 0.5;

  for (const node of scene.visualNodes) {
    const { state } = node;
    if (!state.active || state.opacity <= 0) continue;

    const scale = Math.max(0.01, state.scale);
    const centerX = canvasCenterX + state.x;
    const centerY = canvasCenterY + state.y;
    const rad = ((state.rotation || 0) * Math.PI) / 180;
    const cosR = Math.cos(-rad);
    const sinR = Math.sin(-rad);

    let baseW = node.width;
    let baseH = node.height;
    if (node.kind === 'text') {
      const textLen = Math.max(1, Math.min(32, (node.text || 'TEXT').length));
      const fontSize = node.fontSize ?? 56;
      const pxScale = Math.max(2, Math.round(fontSize / 7));
      baseW = textLen * (6.2 * pxScale);
      baseH = 7 * pxScale;
    }

    const halfW = baseW * 0.5;
    const halfH = baseH * 0.5;
    const scaledHalfW = halfW * scale;
    const scaledHalfH = halfH * scale;
    const boundingRadius = Math.ceil(Math.hypot(scaledHalfW, scaledHalfH)) + 2;

    const minX = clamp(Math.floor(centerX - boundingRadius), 0, width - 1);
    const maxX = clamp(Math.ceil(centerX + boundingRadius), 0, width - 1);
    const minY = clamp(Math.floor(centerY - boundingRadius), 0, height - 1);
    const maxY = clamp(Math.ceil(centerY + boundingRadius), 0, height - 1);

    const [colorR, colorG, colorB, colorA] = parseHexColor(node.color, [255, 255, 255, 255]);
    const baseAlpha = state.opacity * (colorA / 255);

    const mediaKey = node.media?.asset?.id ?? node.media?.uri ?? node.layerId;
    const decodedImage =
      node.kind === 'image' || node.kind === 'video' ? decodedMediaMap.get(mediaKey) : undefined;

    for (let py = minY; py <= maxY; py++) {
      const dy = py - centerY;
      const rowOffset = py * width * 4;
      for (let px = minX; px <= maxX; px++) {
        const dx = px - centerX;
        const localX = (dx * cosR - dy * sinR) / scale;
        const localY = (dx * sinR + dy * cosR) / scale;

        if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) continue;

        const pixelIdx = rowOffset + px * 4;

        if (node.kind === 'shape') {
          if (insideShape(localX, localY, halfW, halfH, node.shape ?? 'rectangle')) {
            blendPixel(buf, pixelIdx, colorR, colorG, colorB, baseAlpha);
          }
        } else if (node.kind === 'text') {
          if (sampleTextGlyph(node.text || node.name, localX, localY, node.fontSize ?? 56)) {
            blendPixel(buf, pixelIdx, colorR, colorG, colorB, baseAlpha);
          }
        } else if (node.kind === 'image' || node.kind === 'video') {
          if (decodedImage && decodedImage.width > 0 && decodedImage.height > 0) {
            const u = clamp((localX + halfW) / Math.max(1, baseW), 0, 0.999999);
            const v = clamp((localY + halfH) / Math.max(1, baseH), 0, 0.999999);
            const sx = Math.floor(u * decodedImage.width);
            const sy = Math.floor(v * decodedImage.height);
            const srcIdx = (sy * decodedImage.width + sx) * 4;
            const sr = decodedImage.data[srcIdx];
            const sg = decodedImage.data[srcIdx + 1];
            const sb = decodedImage.data[srcIdx + 2];
            const sa = (decodedImage.data[srcIdx + 3] / 255) * state.opacity;
            blendPixel(buf, pixelIdx, sr, sg, sb, sa);
          }
        }
      }
    }
  }

  return buf;
}
