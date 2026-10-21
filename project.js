"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIN_DURATION_MS = exports.MIN_DIMENSION = exports.MAX_LAYERS = exports.MAX_DURATION_MS = exports.MAX_DIMENSION = exports.DEFAULT_BG_COLOR = void 0;
exports.isValidHexColor = isValidHexColor;
exports.makeDefaultAudioSettings = makeDefaultAudioSettings;
exports.makeDefaultExportSettings = makeDefaultExportSettings;
exports.makeLayer = makeLayer;
exports.makeProject = makeProject;
exports.migrateProject = migrateProject;
exports.serializeProject = serializeProject;
exports.validateProject = validateProject;
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
var uid = function uid() {
  return "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2, 8));
};
var MAX_LAYERS = 200;
exports.MAX_LAYERS = MAX_LAYERS;
var MAX_DURATION_MS = 3600000; // 1 hour max
exports.MAX_DURATION_MS = MAX_DURATION_MS;
var MIN_DURATION_MS = 100;
exports.MIN_DURATION_MS = MIN_DURATION_MS;
var MAX_DIMENSION = 7680; // 8K max
exports.MAX_DIMENSION = MAX_DIMENSION;
var MIN_DIMENSION = 16;
exports.MIN_DIMENSION = MIN_DIMENSION;
var DEFAULT_BG_COLOR = '#121629';
exports.DEFAULT_BG_COLOR = DEFAULT_BG_COLOR;
var VALID_LAYER_KINDS = ['text', 'shape', 'image', 'video', 'audio'];
var VALID_EASINGS = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'step', 'cubicBezier'];
var VALID_PROPERTIES = ['opacity', 'x', 'y', 'scale', 'rotation', 'volume'];
function makeDefaultAudioSettings() {
  return {
    masterVolume: 1,
    muted: false,
    sampleRate: 44100,
    channels: 2
  };
}
function makeDefaultExportSettings() {
  var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1080;
  var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1920;
  var fps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
  return {
    width: width,
    height: height,
    fps: fps,
    videoBitrateKbps: 6000,
    audioBitrateKbps: 192,
    codec: 'h264',
    preset: 'fast',
    format: 'mp4'
  };
}
function makeLayer(kind, index) {
  var _options$durationMs, _options$inPointMs, _options$outPointMs, _options$name, _options$visible, _options$locked, _options$startMs, _options$opacity, _options$x, _options$y, _options$scale, _options$rotation, _options$text, _options$fontSize, _options$color, _options$shape, _options$width, _options$height, _options$volume, _options$muted;
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var defaultDuration = (_options$durationMs = options.durationMs) !== null && _options$durationMs !== void 0 ? _options$durationMs : 5000;
  var inPointMs = (_options$inPointMs = options.inPointMs) !== null && _options$inPointMs !== void 0 ? _options$inPointMs : 0;
  var outPointMs = (_options$outPointMs = options.outPointMs) !== null && _options$outPointMs !== void 0 ? _options$outPointMs : inPointMs + defaultDuration;
  var defaultWidth = kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 480 : undefined;
  var defaultHeight = kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 320 : undefined;
  return {
    id: uid(),
    name: (_options$name = options.name) !== null && _options$name !== void 0 ? _options$name : "".concat(kind[0].toUpperCase()).concat(kind.slice(1), " ").concat(index),
    kind: kind,
    visible: (_options$visible = options.visible) !== null && _options$visible !== void 0 ? _options$visible : true,
    locked: (_options$locked = options.locked) !== null && _options$locked !== void 0 ? _options$locked : false,
    startMs: (_options$startMs = options.startMs) !== null && _options$startMs !== void 0 ? _options$startMs : 0,
    durationMs: defaultDuration,
    inPointMs: inPointMs,
    outPointMs: outPointMs,
    opacity: (_options$opacity = options.opacity) !== null && _options$opacity !== void 0 ? _options$opacity : 1,
    x: (_options$x = options.x) !== null && _options$x !== void 0 ? _options$x : 0,
    y: (_options$y = options.y) !== null && _options$y !== void 0 ? _options$y : 0,
    scale: (_options$scale = options.scale) !== null && _options$scale !== void 0 ? _options$scale : 1,
    rotation: (_options$rotation = options.rotation) !== null && _options$rotation !== void 0 ? _options$rotation : kind === 'shape' ? 22 : 0,
    text: (_options$text = options.text) !== null && _options$text !== void 0 ? _options$text : kind === 'text' ? 'Your Motion' : '',
    fontSize: (_options$fontSize = options.fontSize) !== null && _options$fontSize !== void 0 ? _options$fontSize : kind === 'text' ? 56 : undefined,
    color: (_options$color = options.color) !== null && _options$color !== void 0 ? _options$color : kind === 'shape' ? '#8B7CFF' : '#FFFFFF',
    shape: (_options$shape = options.shape) !== null && _options$shape !== void 0 ? _options$shape : 'rectangle',
    width: (_options$width = options.width) !== null && _options$width !== void 0 ? _options$width : defaultWidth,
    height: (_options$height = options.height) !== null && _options$height !== void 0 ? _options$height : defaultHeight,
    mediaId: options.mediaId,
    sourceUri: options.sourceUri,
    volume: (_options$volume = options.volume) !== null && _options$volume !== void 0 ? _options$volume : kind === 'video' || kind === 'audio' ? 1 : 0,
    muted: (_options$muted = options.muted) !== null && _options$muted !== void 0 ? _options$muted : false,
    keyframes: options.keyframes ? _toConsumableArray(options.keyframes) : [],
    effects: options.effects ? _toConsumableArray(options.effects) : []
  };
}
function makeProject() {
  var _options$width2, _options$height2, _options$fps, _options$durationMs2, _options$name2, _options$backgroundCo, _options$layers;
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var width = (_options$width2 = options.width) !== null && _options$width2 !== void 0 ? _options$width2 : 1080;
  var height = (_options$height2 = options.height) !== null && _options$height2 !== void 0 ? _options$height2 : 1920;
  var fps = (_options$fps = options.fps) !== null && _options$fps !== void 0 ? _options$fps : 30;
  var durationMs = (_options$durationMs2 = options.durationMs) !== null && _options$durationMs2 !== void 0 ? _options$durationMs2 : 5000;
  var now = new Date().toISOString();
  return {
    schemaVersion: 2,
    id: uid(),
    name: (_options$name2 = options.name) !== null && _options$name2 !== void 0 ? _options$name2 : 'Untitled Project',
    createdAt: now,
    updatedAt: now,
    width: width,
    height: height,
    fps: fps,
    durationMs: durationMs,
    currentTimeMs: 0,
    backgroundColor: (_options$backgroundCo = options.backgroundColor) !== null && _options$backgroundCo !== void 0 ? _options$backgroundCo : DEFAULT_BG_COLOR,
    mediaAssets: [],
    audioSettings: makeDefaultAudioSettings(),
    exportSettings: makeDefaultExportSettings(width, height, fps),
    layers: (_options$layers = options.layers) !== null && _options$layers !== void 0 ? _options$layers : [makeLayer('text', 1, {
      durationMs: durationMs
    }), makeLayer('shape', 2, {
      durationMs: durationMs
    })]
  };
}
function hasForbiddenPrototypeKeys(obj) {
  if (!obj || _typeof(obj) !== 'object') return false;
  var ownKeys = Object.getOwnPropertyNames(obj);
  if (ownKeys.includes('__proto__') || ownKeys.includes('constructor') || ownKeys.includes('prototype')) {
    return true;
  }
  var _iterator = _createForOfIteratorHelper(ownKeys),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var key = _step.value;
      var val = obj[key];
      if (val && _typeof(val) === 'object' && hasForbiddenPrototypeKeys(val)) {
        return true;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
}
function isValidHexColor(color) {
  return typeof color === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Upgrades schemaVersion 1 projects (from MVP / v2 / v3) to schemaVersion 2
 * without losing any layers, keyframes, effects, or custom properties.
 */
function migrateProject(raw) {
  if (!raw || _typeof(raw) !== 'object' || Array.isArray(raw)) {
    throw new Error('Project must be a non-null JSON object.');
  }
  if (hasForbiddenPrototypeKeys(raw)) {
    throw new Error('Security violation: project JSON contains forbidden prototype keys.');
  }
  var input = raw;
  var version = input.schemaVersion;
  if (version !== 1 && version !== 2) {
    throw new Error("Unsupported or invalid project schemaVersion: ".concat(String(version), "."));
  }
  if (typeof input.width !== 'number' || !Number.isFinite(input.width) || input.width < MIN_DIMENSION || input.width > MAX_DIMENSION) {
    throw new Error("Invalid project width: must be a finite number between ".concat(MIN_DIMENSION, " and ").concat(MAX_DIMENSION, "."));
  }
  if (typeof input.height !== 'number' || !Number.isFinite(input.height) || input.height < MIN_DIMENSION || input.height > MAX_DIMENSION) {
    throw new Error("Invalid project height: must be a finite number between ".concat(MIN_DIMENSION, " and ").concat(MAX_DIMENSION, "."));
  }
  var width = Math.round(input.width);
  var height = Math.round(input.height);
  var fps = typeof input.fps === 'number' && Number.isFinite(input.fps) && input.fps >= 1 && input.fps <= 240 ? Math.round(input.fps) : 30;
  var durationMs = typeof input.durationMs === 'number' && Number.isFinite(input.durationMs) && input.durationMs >= MIN_DURATION_MS && input.durationMs <= MAX_DURATION_MS ? Math.round(input.durationMs) : 5000;
  if (!Array.isArray(input.layers)) {
    throw new Error('Invalid project schema: layers must be an array.');
  }
  if (input.layers.length > MAX_LAYERS) {
    throw new Error("Project exceeds the maximum limit of ".concat(MAX_LAYERS, " layers."));
  }
  var migratedLayers = input.layers.map(function (rawLayer, idx) {
    if (!rawLayer || _typeof(rawLayer) !== 'object' || Array.isArray(rawLayer)) {
      throw new Error("Invalid layer at index ".concat(idx, ": must be an object."));
    }
    var l = rawLayer;
    var kind = l.kind;
    if (!VALID_LAYER_KINDS.includes(kind)) {
      throw new Error("Invalid layer kind at index ".concat(idx, ": \"").concat(String(l.kind), "\"."));
    }
    if (typeof l.startMs === 'number' && (!Number.isFinite(l.startMs) || l.startMs < 0)) {
      throw new Error("Invalid layer startMs at index ".concat(idx, ": must be >= 0."));
    }
    if (typeof l.durationMs === 'number' && (!Number.isFinite(l.durationMs) || l.durationMs <= 0)) {
      throw new Error("Invalid layer durationMs at index ".concat(idx, ": must be > 0."));
    }
    var startMs = typeof l.startMs === 'number' ? l.startMs : 0;
    var layerDuration = typeof l.durationMs === 'number' ? l.durationMs : durationMs;
    var inPointMs = typeof l.inPointMs === 'number' && Number.isFinite(l.inPointMs) && l.inPointMs >= 0 ? l.inPointMs : 0;
    var outPointMs = typeof l.outPointMs === 'number' && Number.isFinite(l.outPointMs) && l.outPointMs >= inPointMs ? l.outPointMs : inPointMs + layerDuration;
    var rawKeyframes = Array.isArray(l.keyframes) ? l.keyframes : [];
    var keyframes = rawKeyframes.map(function (rk, kIdx) {
      if (!rk || _typeof(rk) !== 'object') {
        throw new Error("Invalid keyframe at layer ".concat(idx, ", index ").concat(kIdx, "."));
      }
      var k = rk;
      if (typeof k.timeMs !== 'number' || !Number.isFinite(k.timeMs) || typeof k.value !== 'number' || !Number.isFinite(k.value)) {
        throw new Error("Keyframe at layer ".concat(idx, ", index ").concat(kIdx, " has non-numeric timeMs or value."));
      }
      var easing = VALID_EASINGS.includes(k.easing) ? k.easing : 'linear';
      var idStr = typeof k.id === 'string' && k.id.length > 0 ? k.id : "kf-".concat(idx, "-").concat(kIdx, "-").concat(k.timeMs);
      var inferredProp = VALID_PROPERTIES.includes(k.property) ? k.property : idStr.startsWith('x-') ? 'x' : idStr.startsWith('y-') ? 'y' : idStr.startsWith('scale-') ? 'scale' : idStr.startsWith('rotation-') ? 'rotation' : idStr.startsWith('volume-') ? 'volume' : 'opacity';
      var kf = {
        id: idStr,
        timeMs: k.timeMs,
        value: k.value,
        easing: easing,
        property: inferredProp
      };
      if (Array.isArray(k.controlPoints) && k.controlPoints.length === 4 && k.controlPoints.every(function (n) {
        return typeof n === 'number' && Number.isFinite(n);
      })) {
        kf.controlPoints = [Math.max(0, Math.min(1, k.controlPoints[0])), k.controlPoints[1], Math.max(0, Math.min(1, k.controlPoints[2])), k.controlPoints[3]];
      }
      return kf;
    });
    var colorStr = isValidHexColor(l.color) ? l.color : kind === 'shape' ? '#8B7CFF' : '#FFFFFF';
    return {
      id: typeof l.id === 'string' && l.id.length > 0 ? l.id : uid(),
      name: typeof l.name === 'string' && l.name.length > 0 ? l.name : "".concat(kind, " ").concat(idx + 1),
      kind: kind,
      visible: typeof l.visible === 'boolean' ? l.visible : true,
      locked: typeof l.locked === 'boolean' ? l.locked : false,
      startMs: startMs,
      durationMs: layerDuration,
      inPointMs: inPointMs,
      outPointMs: outPointMs,
      opacity: typeof l.opacity === 'number' && Number.isFinite(l.opacity) ? Math.max(0, Math.min(1, l.opacity)) : 1,
      x: typeof l.x === 'number' && Number.isFinite(l.x) ? l.x : 0,
      y: typeof l.y === 'number' && Number.isFinite(l.y) ? l.y : 0,
      scale: typeof l.scale === 'number' && Number.isFinite(l.scale) && l.scale > 0 ? Math.max(0.01, Math.min(100, l.scale)) : 1,
      rotation: typeof l.rotation === 'number' && Number.isFinite(l.rotation) ? l.rotation : 0,
      text: typeof l.text === 'string' ? l.text : kind === 'text' ? 'Your Motion' : '',
      fontSize: typeof l.fontSize === 'number' && Number.isFinite(l.fontSize) && l.fontSize > 4 ? l.fontSize : kind === 'text' ? 56 : undefined,
      color: colorStr,
      shape: l.shape === 'circle' || l.shape === 'rectangle' || l.shape === 'rounded' || l.shape === 'triangle' ? l.shape : 'rectangle',
      width: typeof l.width === 'number' && Number.isFinite(l.width) && l.width > 0 ? l.width : kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 480 : undefined,
      height: typeof l.height === 'number' && Number.isFinite(l.height) && l.height > 0 ? l.height : kind === 'shape' ? 240 : kind === 'image' || kind === 'video' ? 320 : undefined,
      mediaId: typeof l.mediaId === 'string' ? l.mediaId : undefined,
      sourceUri: typeof l.sourceUri === 'string' ? l.sourceUri : undefined,
      volume: typeof l.volume === 'number' && Number.isFinite(l.volume) ? Math.max(0, Math.min(2, l.volume)) : kind === 'video' || kind === 'audio' ? 1 : 0,
      muted: typeof l.muted === 'boolean' ? l.muted : false,
      keyframes: keyframes.sort(function (a, b) {
        return a.timeMs - b.timeMs;
      }),
      effects: Array.isArray(l.effects) ? l.effects : []
    };
  });
  var mediaAssets = Array.isArray(input.mediaAssets) ? input.mediaAssets.filter(function (m) {
    return m && _typeof(m) === 'object' && typeof m.id === 'string' && typeof m.uri === 'string';
  }) : [];
  var currentTimeMs = typeof input.currentTimeMs === 'number' && Number.isFinite(input.currentTimeMs) ? Math.max(0, Math.min(durationMs, input.currentTimeMs)) : 0;
  return {
    schemaVersion: 2,
    id: typeof input.id === 'string' && input.id.length > 0 ? input.id : uid(),
    name: typeof input.name === 'string' && input.name.trim().length > 0 ? input.name.trim() : 'Untitled Project',
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    width: width,
    height: height,
    fps: fps,
    durationMs: durationMs,
    currentTimeMs: currentTimeMs,
    backgroundColor: isValidHexColor(input.backgroundColor) ? input.backgroundColor : DEFAULT_BG_COLOR,
    mediaAssets: mediaAssets,
    audioSettings: input.audioSettings && _typeof(input.audioSettings) === 'object' ? _objectSpread(_objectSpread({}, makeDefaultAudioSettings()), input.audioSettings) : makeDefaultAudioSettings(),
    exportSettings: input.exportSettings && _typeof(input.exportSettings) === 'object' ? _objectSpread(_objectSpread({}, makeDefaultExportSettings(width, height, fps)), input.exportSettings) : makeDefaultExportSettings(width, height, fps),
    layers: migratedLayers
  };
}
function validateProject(input) {
  return migrateProject(input);
}
function serializeProject(project) {
  return JSON.stringify(project, null, 2);
}