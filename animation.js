"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ease = ease;
exports.evaluateLayerAtTime = evaluateLayerAtTime;
exports.interpolateKeyframes = interpolateKeyframes;
exports.keyframeProperty = keyframeProperty;
exports.solveCubicBezier = solveCubicBezier;
exports.sortKeyframesDeterministically = sortKeyframesDeterministically;
var _timeline = require("./timeline");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/** Resolve a keyframe's animated property. Older schema-v1 keyframes are treated as opacity keys. */
function keyframeProperty(keyframe) {
  var property = keyframe.property;
  if (property === 'x' || property === 'y' || property === 'scale' || property === 'opacity' || property === 'rotation' || property === 'volume') {
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
function sampleCurve(p1, p2, s) {
  var inv = 1 - s;
  return 3 * inv * inv * s * p1 + 3 * inv * s * s * p2 + s * s * s;
}
function sampleCurveDerivative(p1, p2, s) {
  var inv = 1 - s;
  return 3 * inv * inv * p1 + 6 * inv * s * (p2 - p1) + 3 * s * s * (1 - p2);
}

/**
 * Solves cubic-bezier(x1, y1, x2, y2) for normalized progress t in [0, 1] using
 * Newton-Raphson with binary-search fallback.
 */
function solveCubicBezier(x1, y1, x2, y2, t) {
  var x = (0, _timeline.clamp)(t, 0, 1);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  var cx1 = (0, _timeline.clamp)(x1, 0, 1);
  var cx2 = (0, _timeline.clamp)(x2, 0, 1);
  if (cx1 === y1 && cx2 === y2) return x;
  var s = x;
  // Newton-Raphson iterations
  for (var i = 0; i < 8; i++) {
    var currentX = sampleCurve(cx1, cx2, s) - x;
    if (Math.abs(currentX) < 1e-6) {
      return sampleCurve(y1, y2, s);
    }
    var derivative = sampleCurveDerivative(cx1, cx2, s);
    if (Math.abs(derivative) < 1e-6) break;
    s -= currentX / derivative;
  }

  // Fallback to binary subdivision
  var low = 0;
  var high = 1;
  s = x;
  for (var _i = 0; _i < 16; _i++) {
    var _currentX = sampleCurve(cx1, cx2, s);
    if (Math.abs(_currentX - x) < 1e-6) break;
    if (x > _currentX) low = s;else high = s;
    s = (high + low) * 0.5;
  }
  return sampleCurve(y1, y2, s);
}
function ease(t, mode, controlPoints) {
  var x = (0, _timeline.clamp)(t, 0, 1);
  switch (mode) {
    case 'easeIn':
      return x * x;
    case 'easeOut':
      return 1 - (1 - x) * (1 - x);
    case 'easeInOut':
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case 'step':
      return x >= 1 ? 1 : 0;
    case 'cubicBezier':
      {
        var _ref = controlPoints !== null && controlPoints !== void 0 ? controlPoints : [0.42, 0, 0.58, 1],
          _ref2 = _slicedToArray(_ref, 4),
          x1 = _ref2[0],
          y1 = _ref2[1],
          x2 = _ref2[2],
          y2 = _ref2[3];
        return solveCubicBezier(x1, y1, x2, y2, x);
      }
    default:
      return x;
  }
}
function sortKeyframesDeterministically(keyframes) {
  return keyframes.map(function (kf, idx) {
    return {
      kf: kf,
      idx: idx
    };
  }).sort(function (a, b) {
    return a.kf.timeMs !== b.kf.timeMs ? a.kf.timeMs - b.kf.timeMs : a.idx - b.idx;
  }).map(function (entry) {
    return entry.kf;
  });
}
function interpolateKeyframes(keyframes, timeMs, fallback) {
  if (!keyframes.length) return fallback;
  var sorted = sortKeyframesDeterministically(keyframes);
  if (timeMs <= sorted[0].timeMs) {
    // If multiple keyframes exist at sorted[0].timeMs and timeMs === sorted[0].timeMs,
    // use the last keyframe at that exact timestamp.
    if (timeMs === sorted[0].timeMs) {
      var idx = 0;
      while (idx + 1 < sorted.length && sorted[idx + 1].timeMs === sorted[0].timeMs) {
        idx++;
      }
      return sorted[idx].value;
    }
    return sorted[0].value;
  }
  var last = sorted[sorted.length - 1];
  if (timeMs >= last.timeMs) return last.value;
  for (var i = 0; i < sorted.length - 1; i++) {
    var left = sorted[i];
    var right = sorted[i + 1];
    if (timeMs < left.timeMs || timeMs > right.timeMs) continue;
    var span = right.timeMs - left.timeMs;
    if (span <= 0) {
      continue;
    }
    if (left.easing === 'step') {
      return timeMs >= right.timeMs ? right.value : left.value;
    }
    var progress = ease((timeMs - left.timeMs) / span, left.easing, left.controlPoints);
    return left.value + (right.value - left.value) * progress;
  }
  return last.value;
}
function evaluateLayerAtTime(layer, projectTimeMs) {
  var _layer$inPointMs, _layer$rotation, _layer$volume, _layer$volume2;
  var localTimeMs = projectTimeMs - layer.startMs;
  var active = layer.durationMs > 0 && localTimeMs >= 0 && localTimeMs <= layer.durationMs;
  var inPointMs = (_layer$inPointMs = layer.inPointMs) !== null && _layer$inPointMs !== void 0 ? _layer$inPointMs : 0;
  var sourceTimeMs = Math.max(inPointMs, inPointMs + localTimeMs);
  var baseRotation = (_layer$rotation = layer.rotation) !== null && _layer$rotation !== void 0 ? _layer$rotation : 0;
  var baseVolume = layer.muted ? 0 : (_layer$volume = layer.volume) !== null && _layer$volume !== void 0 ? _layer$volume : layer.kind === 'video' || layer.kind === 'audio' ? 1 : 0;
  if (!active || !layer.visible) {
    return {
      opacity: 0,
      x: layer.x,
      y: layer.y,
      scale: layer.scale,
      rotation: baseRotation,
      volume: 0,
      active: false,
      localTimeMs: localTimeMs,
      sourceTimeMs: sourceTimeMs
    };
  }
  var grouped = {
    opacity: [],
    x: [],
    y: [],
    scale: [],
    rotation: [],
    volume: []
  };
  var _iterator = _createForOfIteratorHelper(layer.keyframes),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var keyframe = _step.value;
      grouped[keyframeProperty(keyframe)].push(keyframe);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var rawVolume = interpolateKeyframes(grouped.volume, localTimeMs, (_layer$volume2 = layer.volume) !== null && _layer$volume2 !== void 0 ? _layer$volume2 : 1);
  return {
    opacity: (0, _timeline.clamp)(interpolateKeyframes(grouped.opacity, localTimeMs, layer.opacity), 0, 1),
    x: interpolateKeyframes(grouped.x, localTimeMs, layer.x),
    y: interpolateKeyframes(grouped.y, localTimeMs, layer.y),
    scale: (0, _timeline.clamp)(interpolateKeyframes(grouped.scale, localTimeMs, layer.scale), 0.01, 100),
    rotation: (0, _timeline.clamp)(interpolateKeyframes(grouped.rotation, localTimeMs, baseRotation), -36000, 36000),
    volume: layer.muted ? 0 : (0, _timeline.clamp)(rawVolume, 0, 2),
    active: true,
    localTimeMs: localTimeMs,
    sourceTimeMs: sourceTimeMs
  };
}