"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLayer = addLayer;
exports.addMediaLayer = addMediaLayer;
exports.addOpacityKeyframe = addOpacityKeyframe;
exports.addPropertyKeyframe = addPropertyKeyframe;
exports.clamp = void 0;
exports.duplicateLayer = duplicateLayer;
exports.moveLayerOrder = moveLayerOrder;
exports.movePlayhead = movePlayhead;
exports.removeKeyframe = removeKeyframe;
exports.removeLayer = removeLayer;
exports.reorderLayer = reorderLayer;
exports.splitLayerAtTime = splitLayerAtTime;
exports.stepFrame = stepFrame;
exports.trimLayer = trimLayer;
exports.updateKeyframeEasing = updateKeyframeEasing;
var _project = require("./project");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var clamp = function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
};
exports.clamp = clamp;
function addLayer(project, kind) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var layer = (0, _project.makeLayer)(kind, project.layers.length + 1, _objectSpread({
    durationMs: project.durationMs
  }, options));
  return _objectSpread(_objectSpread({}, project), {}, {
    updatedAt: new Date().toISOString(),
    layers: [].concat(_toConsumableArray(project.layers), [layer])
  });
}
function addMediaLayer(project, asset) {
  var _project$mediaAssets, _asset$width, _asset$height;
  var existingAssets = (_project$mediaAssets = project.mediaAssets) !== null && _project$mediaAssets !== void 0 ? _project$mediaAssets : [];
  var hasAsset = existingAssets.some(function (a) {
    return a.id === asset.id;
  });
  var mediaAssets = hasAsset ? existingAssets.map(function (a) {
    return a.id === asset.id ? asset : a;
  }) : [].concat(_toConsumableArray(existingAssets), [asset]);
  var clipDuration = asset.durationMs && asset.durationMs > 0 ? Math.min(project.durationMs, Math.max(_project.MIN_DURATION_MS, Math.round(asset.durationMs))) : project.durationMs;
  var layer = (0, _project.makeLayer)(asset.kind, project.layers.length + 1, {
    name: asset.name || "".concat(asset.kind.toUpperCase(), " ").concat(project.layers.length + 1),
    mediaId: asset.id,
    sourceUri: asset.uri,
    startMs: project.currentTimeMs < project.durationMs ? project.currentTimeMs : 0,
    durationMs: clipDuration,
    inPointMs: 0,
    outPointMs: clipDuration,
    width: (_asset$width = asset.width) !== null && _asset$width !== void 0 ? _asset$width : asset.kind === 'audio' ? undefined : 480,
    height: (_asset$height = asset.height) !== null && _asset$height !== void 0 ? _asset$height : asset.kind === 'audio' ? undefined : 320,
    volume: asset.kind === 'video' || asset.kind === 'audio' ? 1 : 0
  });
  var requiredDuration = Math.max(project.durationMs, layer.startMs + layer.durationMs);
  return _objectSpread(_objectSpread({}, project), {}, {
    durationMs: requiredDuration,
    mediaAssets: mediaAssets,
    updatedAt: new Date().toISOString(),
    layers: [].concat(_toConsumableArray(project.layers), [layer])
  });
}
function removeLayer(project, layerId) {
  return _objectSpread(_objectSpread({}, project), {}, {
    updatedAt: new Date().toISOString(),
    layers: project.layers.filter(function (l) {
      return l.id !== layerId;
    })
  });
}
function duplicateLayer(project, layerId) {
  var index = project.layers.findIndex(function (l) {
    return l.id === layerId;
  });
  if (index === -1) return project;
  var source = project.layers[index];
  var copyId = "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2, 7));
  var copy = _objectSpread(_objectSpread({}, source), {}, {
    id: copyId,
    name: "".concat(source.name, " Copy"),
    keyframes: source.keyframes.map(function (k) {
      var _k$property;
      return _objectSpread(_objectSpread({}, k), {}, {
        id: "".concat((_k$property = k.property) !== null && _k$property !== void 0 ? _k$property : 'opacity', "-").concat(k.timeMs, "-").concat(Math.random().toString(36).slice(2, 5))
      });
    }),
    effects: source.effects.map(function (e) {
      return _objectSpread({}, e);
    })
  });
  var nextLayers = _toConsumableArray(project.layers);
  nextLayers.splice(index + 1, 0, copy);
  return _objectSpread(_objectSpread({}, project), {}, {
    updatedAt: new Date().toISOString(),
    layers: nextLayers
  });
}
function reorderLayer(project, fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= project.layers.length || toIndex < 0 || toIndex >= project.layers.length || fromIndex === toIndex) {
    return project;
  }
  var nextLayers = _toConsumableArray(project.layers);
  var _nextLayers$splice = nextLayers.splice(fromIndex, 1),
    _nextLayers$splice2 = _slicedToArray(_nextLayers$splice, 1),
    moved = _nextLayers$splice2[0];
  nextLayers.splice(toIndex, 0, moved);
  return _objectSpread(_objectSpread({}, project), {}, {
    updatedAt: new Date().toISOString(),
    layers: nextLayers
  });
}
function moveLayerOrder(project, layerId, direction) {
  var index = project.layers.findIndex(function (l) {
    return l.id === layerId;
  });
  if (index === -1) return project;
  var lastIndex = project.layers.length - 1;
  // Note: index 0 is rendered on top in the timeline list (or frontmost when reversed in painter's algorithm).
  var targetIndex = index;
  if (direction === 'up') targetIndex = Math.max(0, index - 1);else if (direction === 'down') targetIndex = Math.min(lastIndex, index + 1);else if (direction === 'front') targetIndex = 0;else if (direction === 'back') targetIndex = lastIndex;
  return reorderLayer(project, index, targetIndex);
}
function trimLayer(layer, newStartMs, newDurationMs, newInPointMs) {
  var _layer$inPointMs;
  var maxProjectDurationMs = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 3600000;
  if (layer.locked) return layer;
  var startMs = clamp(Math.round(newStartMs), 0, maxProjectDurationMs - _project.MIN_DURATION_MS);
  var durationMs = clamp(Math.round(newDurationMs), _project.MIN_DURATION_MS, maxProjectDurationMs - startMs);
  var inPointMs = newInPointMs !== undefined ? Math.max(0, Math.round(newInPointMs)) : Math.max(0, (_layer$inPointMs = layer.inPointMs) !== null && _layer$inPointMs !== void 0 ? _layer$inPointMs : 0);
  var outPointMs = inPointMs + durationMs;

  // Clamp or retain keyframes within the new [0, durationMs] local window
  var adjustedKeyframes = layer.keyframes.map(function (k) {
    return _objectSpread(_objectSpread({}, k), {}, {
      timeMs: clamp(k.timeMs, 0, durationMs)
    });
  });
  return _objectSpread(_objectSpread({}, layer), {}, {
    startMs: startMs,
    durationMs: durationMs,
    inPointMs: inPointMs,
    outPointMs: outPointMs,
    keyframes: adjustedKeyframes.sort(function (a, b) {
      return a.timeMs - b.timeMs;
    })
  });
}
function splitLayerAtTime(project, layerId, splitTimeMs) {
  var _layer$inPointMs2;
  var index = project.layers.findIndex(function (l) {
    return l.id === layerId;
  });
  if (index === -1) return project;
  var layer = project.layers[index];
  if (layer.locked) return project;
  var localSplitMs = Math.round(splitTimeMs - layer.startMs);
  if (localSplitMs < _project.MIN_DURATION_MS || layer.durationMs - localSplitMs < _project.MIN_DURATION_MS) {
    return project;
  }
  var baseInPoint = (_layer$inPointMs2 = layer.inPointMs) !== null && _layer$inPointMs2 !== void 0 ? _layer$inPointMs2 : 0;
  var firstHalf = _objectSpread(_objectSpread({}, layer), {}, {
    durationMs: localSplitMs,
    inPointMs: baseInPoint,
    outPointMs: baseInPoint + localSplitMs,
    keyframes: layer.keyframes.filter(function (k) {
      return k.timeMs <= localSplitMs;
    })
  });
  var secondHalfId = "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2, 7));
  var secondHalf = _objectSpread(_objectSpread({}, layer), {}, {
    id: secondHalfId,
    name: "".concat(layer.name, " (Part 2)"),
    startMs: layer.startMs + localSplitMs,
    durationMs: layer.durationMs - localSplitMs,
    inPointMs: baseInPoint + localSplitMs,
    outPointMs: baseInPoint + layer.durationMs,
    keyframes: layer.keyframes.filter(function (k) {
      return k.timeMs >= localSplitMs;
    }).map(function (k) {
      var _k$property2;
      return _objectSpread(_objectSpread({}, k), {}, {
        id: "".concat((_k$property2 = k.property) !== null && _k$property2 !== void 0 ? _k$property2 : 'opacity', "-").concat(k.timeMs - localSplitMs, "-").concat(Math.random().toString(36).slice(2, 5)),
        timeMs: k.timeMs - localSplitMs
      });
    })
  });
  var nextLayers = _toConsumableArray(project.layers);
  nextLayers.splice(index, 1, firstHalf, secondHalf);
  return _objectSpread(_objectSpread({}, project), {}, {
    updatedAt: new Date().toISOString(),
    layers: nextLayers
  });
}
function movePlayhead(project, timeMs) {
  return _objectSpread(_objectSpread({}, project), {}, {
    currentTimeMs: clamp(timeMs, 0, project.durationMs)
  });
}
function stepFrame(project, deltaFrames) {
  var fps = Math.max(1, project.fps || 30);
  var frameDurationMs = 1000 / fps;
  var currentFrame = Math.round(project.currentTimeMs / frameDurationMs);
  var nextFrame = currentFrame + deltaFrames;
  var nextTimeMs = Math.round(nextFrame * frameDurationMs);
  return movePlayhead(project, nextTimeMs);
}
function resolveLayerPropertyValue(layer, property) {
  var _layer$rotation, _layer$volume;
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
      return (_layer$rotation = layer.rotation) !== null && _layer$rotation !== void 0 ? _layer$rotation : 0;
    case 'volume':
      return (_layer$volume = layer.volume) !== null && _layer$volume !== void 0 ? _layer$volume : 1;
  }
}
function addPropertyKeyframe(layer, timeMs, property, valueOverride) {
  var easing = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'linear';
  var controlPoints = arguments.length > 5 ? arguments[5] : undefined;
  if (layer.locked) return layer;
  var clampedTime = clamp(Math.round(timeMs), 0, layer.durationMs);
  var value = valueOverride !== undefined ? valueOverride : resolveLayerPropertyValue(layer, property);
  var id = "".concat(property, "-").concat(clampedTime);
  var keyframes = layer.keyframes.filter(function (k) {
    return !(k.timeMs === clampedTime && (k.property === property || k.id.startsWith("".concat(property, "-"))));
  });
  var nextKf = {
    id: id,
    timeMs: clampedTime,
    value: value,
    easing: easing,
    property: property
  };
  if (easing === 'cubicBezier') {
    nextKf.controlPoints = controlPoints !== null && controlPoints !== void 0 ? controlPoints : [0.42, 0, 0.58, 1];
  }
  keyframes.push(nextKf);
  return _objectSpread(_objectSpread({}, layer), {}, {
    keyframes: keyframes.sort(function (a, b) {
      return a.timeMs - b.timeMs;
    })
  });
}
function removeKeyframe(layer, keyframeId) {
  if (layer.locked) return layer;
  return _objectSpread(_objectSpread({}, layer), {}, {
    keyframes: layer.keyframes.filter(function (k) {
      return k.id !== keyframeId;
    })
  });
}
function updateKeyframeEasing(layer, keyframeId, easing, controlPoints) {
  if (layer.locked) return layer;
  return _objectSpread(_objectSpread({}, layer), {}, {
    keyframes: layer.keyframes.map(function (k) {
      var _ref;
      return k.id === keyframeId ? _objectSpread(_objectSpread({}, k), {}, {
        easing: easing,
        controlPoints: easing === 'cubicBezier' ? (_ref = controlPoints !== null && controlPoints !== void 0 ? controlPoints : k.controlPoints) !== null && _ref !== void 0 ? _ref : [0.42, 0, 0.58, 1] : undefined
      }) : k;
    })
  });
}
function addOpacityKeyframe(layer, timeMs) {
  return addPropertyKeyframe(layer, timeMs, 'opacity');
}