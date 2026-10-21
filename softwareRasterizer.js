"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseHexColor = parseHexColor;
exports.renderSceneToRgba = renderSceneToRgba;
var _timeline = require("../core/timeline");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function parseHexColor(hex) {
  var defaultColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [18, 22, 41, 255];
  if (typeof hex !== 'string' || !hex.startsWith('#')) return defaultColor;
  var clean = hex.slice(1).trim();
  if (clean.length === 3) {
    var r = parseInt(clean[0] + clean[0], 16);
    var g = parseInt(clean[1] + clean[1], 16);
    var b = parseInt(clean[2] + clean[2], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return defaultColor;
    return [r, g, b, 255];
  }
  if (clean.length === 6 || clean.length === 8) {
    var _r = parseInt(clean.slice(0, 2), 16);
    var _g = parseInt(clean.slice(2, 4), 16);
    var _b = parseInt(clean.slice(4, 6), 16);
    var a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) : 255;
    if (Number.isNaN(_r) || Number.isNaN(_g) || Number.isNaN(_b) || Number.isNaN(a)) return defaultColor;
    return [_r, _g, _b, a];
  }
  return defaultColor;
}
var GLYPH_5X7 = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [28, 18, 17, 17, 17, 18, 28],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 14],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 18, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  '0': [14, 17, 19, 21, 25, 17, 14],
  '1': [4, 12, 4, 4, 4, 4, 14],
  '2': [14, 17, 1, 2, 4, 8, 31],
  '3': [30, 1, 1, 14, 1, 1, 30],
  '4': [2, 6, 10, 18, 31, 2, 2],
  '5': [31, 16, 30, 1, 1, 17, 14],
  '6': [14, 16, 16, 30, 17, 17, 14],
  '7': [31, 1, 2, 4, 8, 8, 8],
  '8': [14, 17, 17, 14, 17, 17, 14],
  '9': [14, 17, 17, 15, 1, 1, 14],
  '-': [0, 0, 0, 31, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 12, 12],
  ':': [0, 12, 12, 0, 12, 12, 0],
  '!': [4, 4, 4, 4, 4, 0, 4],
  ' ': [0, 0, 0, 0, 0, 0, 0]
};
function blendPixel(buf, idx, r, g, b, alpha01) {
  var a = (0, _timeline.clamp)(alpha01, 0, 1);
  if (a <= 0) return;
  if (a >= 0.999) {
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = 255;
    return;
  }
  var invA = 1 - a;
  buf[idx] = Math.round(r * a + buf[idx] * invA);
  buf[idx + 1] = Math.round(g * a + buf[idx + 1] * invA);
  buf[idx + 2] = Math.round(b * a + buf[idx + 2] * invA);
  buf[idx + 3] = 255;
}
function insideShape(localX, localY, halfW, halfH, shape) {
  if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) return false;
  if (shape === 'circle') {
    var nx = localX / Math.max(1, halfW);
    var ny = localY / Math.max(1, halfH);
    return nx * nx + ny * ny <= 1;
  }
  if (shape === 'triangle') {
    var normY = (localY + halfH) / Math.max(1, 2 * halfH);
    var maxAbsX = normY * halfW;
    return Math.abs(localX) <= maxAbsX;
  }
  if (shape === 'rounded') {
    var cornerRadius = Math.min(halfW, halfH) * 0.25;
    var qx = Math.abs(localX) - (halfW - cornerRadius);
    var qy = Math.abs(localY) - (halfH - cornerRadius);
    if (qx > 0 && qy > 0) {
      return qx * qx + qy * qy <= cornerRadius * cornerRadius;
    }
    return true;
  }
  return true;
}
function sampleTextGlyph(text, localX, localY, fontSize) {
  var _GLYPH_5X7$ch, _pattern$row;
  var clean = (text || 'TEXT').toUpperCase().slice(0, 32);
  var pixelScale = Math.max(2, Math.round(fontSize / 7));
  var glyphW = 5 * pixelScale;
  var glyphH = 7 * pixelScale;
  var gap = Math.max(2, Math.round(pixelScale * 1.2));
  var totalW = clean.length * glyphW + Math.max(0, clean.length - 1) * gap;
  var relX = localX + totalW / 2;
  var relY = localY + glyphH / 2;
  if (relX < 0 || relX >= totalW || relY < 0 || relY >= glyphH) return false;
  var stride = glyphW + gap;
  var charIdx = Math.floor(relX / stride);
  if (charIdx < 0 || charIdx >= clean.length) return false;
  var inCharX = relX - charIdx * stride;
  if (inCharX >= glyphW) return false;
  var col = Math.floor(inCharX / pixelScale);
  var row = Math.floor(relY / pixelScale);
  if (col < 0 || col >= 5 || row < 0 || row >= 7) return false;
  var ch = clean[charIdx];
  var pattern = (_GLYPH_5X7$ch = GLYPH_5X7[ch]) !== null && _GLYPH_5X7$ch !== void 0 ? _GLYPH_5X7$ch : GLYPH_5X7['O'];
  var rowBits = (_pattern$row = pattern[row]) !== null && _pattern$row !== void 0 ? _pattern$row : 0;
  return (rowBits >> 4 - col & 1) === 1;
}
function renderSceneToRgba(scene) {
  var decodedMediaMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Map();
  var targetBuffer = arguments.length > 2 ? arguments[2] : undefined;
  var width = scene.width,
    height = scene.height;
  var totalBytes = width * height * 4;
  var buf = targetBuffer && targetBuffer.byteLength === totalBytes ? targetBuffer : new Uint8Array(totalBytes);
  var _parseHexColor = parseHexColor(scene.backgroundColor),
    _parseHexColor2 = _slicedToArray(_parseHexColor, 4),
    bgR = _parseHexColor2[0],
    bgG = _parseHexColor2[1],
    bgB = _parseHexColor2[2],
    bgA = _parseHexColor2[3];
  for (var i = 0; i < totalBytes; i += 4) {
    buf[i] = bgR;
    buf[i + 1] = bgG;
    buf[i + 2] = bgB;
    buf[i + 3] = bgA;
  }
  var canvasCenterX = width * 0.5;
  var canvasCenterY = height * 0.5;
  var _iterator = _createForOfIteratorHelper(scene.visualNodes),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ref, _node$media$asset$id, _node$media, _node$media$asset, _node$media2;
      var node = _step.value;
      var state = node.state;
      if (!state.active || state.opacity <= 0) continue;
      var scale = Math.max(0.01, state.scale);
      var centerX = canvasCenterX + state.x;
      var centerY = canvasCenterY + state.y;
      var rad = (state.rotation || 0) * Math.PI / 180;
      var cosR = Math.cos(-rad);
      var sinR = Math.sin(-rad);
      var baseW = node.width;
      var baseH = node.height;
      if (node.kind === 'text') {
        var _node$fontSize;
        var textLen = Math.max(1, Math.min(32, (node.text || 'TEXT').length));
        var fontSize = (_node$fontSize = node.fontSize) !== null && _node$fontSize !== void 0 ? _node$fontSize : 56;
        var pxScale = Math.max(2, Math.round(fontSize / 7));
        baseW = textLen * (6.2 * pxScale);
        baseH = 7 * pxScale;
      }
      var halfW = baseW * 0.5;
      var halfH = baseH * 0.5;
      var scaledHalfW = halfW * scale;
      var scaledHalfH = halfH * scale;
      var boundingRadius = Math.ceil(Math.hypot(scaledHalfW, scaledHalfH)) + 2;
      var minX = (0, _timeline.clamp)(Math.floor(centerX - boundingRadius), 0, width - 1);
      var maxX = (0, _timeline.clamp)(Math.ceil(centerX + boundingRadius), 0, width - 1);
      var minY = (0, _timeline.clamp)(Math.floor(centerY - boundingRadius), 0, height - 1);
      var maxY = (0, _timeline.clamp)(Math.ceil(centerY + boundingRadius), 0, height - 1);
      var _parseHexColor3 = parseHexColor(node.color, [255, 255, 255, 255]),
        _parseHexColor4 = _slicedToArray(_parseHexColor3, 4),
        colorR = _parseHexColor4[0],
        colorG = _parseHexColor4[1],
        colorB = _parseHexColor4[2],
        colorA = _parseHexColor4[3];
      var baseAlpha = state.opacity * (colorA / 255);
      var mediaKey = (_ref = (_node$media$asset$id = (_node$media = node.media) === null || _node$media === void 0 ? void 0 : (_node$media$asset = _node$media.asset) === null || _node$media$asset === void 0 ? void 0 : _node$media$asset.id) !== null && _node$media$asset$id !== void 0 ? _node$media$asset$id : (_node$media2 = node.media) === null || _node$media2 === void 0 ? void 0 : _node$media2.uri) !== null && _ref !== void 0 ? _ref : node.layerId;
      var decodedImage = node.kind === 'image' || node.kind === 'video' ? decodedMediaMap.get(mediaKey) : undefined;
      for (var py = minY; py <= maxY; py++) {
        var dy = py - centerY;
        var rowOffset = py * width * 4;
        for (var px = minX; px <= maxX; px++) {
          var dx = px - centerX;
          var localX = (dx * cosR - dy * sinR) / scale;
          var localY = (dx * sinR + dy * cosR) / scale;
          if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) continue;
          var pixelIdx = rowOffset + px * 4;
          if (node.kind === 'shape') {
            var _node$shape;
            if (insideShape(localX, localY, halfW, halfH, (_node$shape = node.shape) !== null && _node$shape !== void 0 ? _node$shape : 'rectangle')) {
              blendPixel(buf, pixelIdx, colorR, colorG, colorB, baseAlpha);
            }
          } else if (node.kind === 'text') {
            var _node$fontSize2;
            if (sampleTextGlyph(node.text || node.name, localX, localY, (_node$fontSize2 = node.fontSize) !== null && _node$fontSize2 !== void 0 ? _node$fontSize2 : 56)) {
              blendPixel(buf, pixelIdx, colorR, colorG, colorB, baseAlpha);
            }
          } else if (node.kind === 'image' || node.kind === 'video') {
            if (decodedImage && decodedImage.width > 0 && decodedImage.height > 0) {
              var u = (0, _timeline.clamp)((localX + halfW) / Math.max(1, baseW), 0, 0.999999);
              var v = (0, _timeline.clamp)((localY + halfH) / Math.max(1, baseH), 0, 0.999999);
              var sx = Math.floor(u * decodedImage.width);
              var sy = Math.floor(v * decodedImage.height);
              var srcIdx = (sy * decodedImage.width + sx) * 4;
              var sr = decodedImage.data[srcIdx];
              var sg = decodedImage.data[srcIdx + 1];
              var sb = decodedImage.data[srcIdx + 2];
              var sa = decodedImage.data[srcIdx + 3] / 255 * state.opacity;
              blendPixel(buf, pixelIdx, sr, sg, sb, sa);
            }
          }
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return buf;
}