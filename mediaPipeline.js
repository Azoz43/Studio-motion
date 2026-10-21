"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.computeAudioMixPlan = computeAudioMixPlan;
exports.parsePngDimensions = parsePngDimensions;
exports.parseWavMetadata = parseWavMetadata;
exports.validateAndCreateMediaAsset = validateAndCreateMediaAsset;
var _animation = require("../core/animation");
var _timeline = require("../core/timeline");
var _validation = require("../security/validation");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function computeAudioMixPlan(project) {
  var _project$audioSetting, _project$audioSetting2, _project$audioSetting3, _project$audioSetting4, _project$audioSetting5, _project$audioSetting6, _project$audioSetting7, _project$audioSetting8, _project$mediaAssets;
  var sampleRate = (_project$audioSetting = (_project$audioSetting2 = project.audioSettings) === null || _project$audioSetting2 === void 0 ? void 0 : _project$audioSetting2.sampleRate) !== null && _project$audioSetting !== void 0 ? _project$audioSetting : 44100;
  var channels = (_project$audioSetting3 = (_project$audioSetting4 = project.audioSettings) === null || _project$audioSetting4 === void 0 ? void 0 : _project$audioSetting4.channels) !== null && _project$audioSetting3 !== void 0 ? _project$audioSetting3 : 2;
  var masterMuted = (_project$audioSetting5 = (_project$audioSetting6 = project.audioSettings) === null || _project$audioSetting6 === void 0 ? void 0 : _project$audioSetting6.muted) !== null && _project$audioSetting5 !== void 0 ? _project$audioSetting5 : false;
  var masterVolume = (0, _timeline.clamp)((_project$audioSetting7 = (_project$audioSetting8 = project.audioSettings) === null || _project$audioSetting8 === void 0 ? void 0 : _project$audioSetting8.masterVolume) !== null && _project$audioSetting7 !== void 0 ? _project$audioSetting7 : 1, 0, 2);
  var assets = (_project$mediaAssets = project.mediaAssets) !== null && _project$mediaAssets !== void 0 ? _project$mediaAssets : [];
  var tracks = [];
  var _iterator = _createForOfIteratorHelper(project.layers),
    _step;
  try {
    var _loop = function _loop() {
      var _asset$uri, _layer$inPointMs, _layer$volume;
      var layer = _step.value;
      if (!layer.visible || layer.muted || masterMuted) return "continue";
      if (layer.kind !== 'audio' && layer.kind !== 'video') return "continue";
      var asset = layer.mediaId ? assets.find(function (a) {
        return a.id === layer.mediaId;
      }) : layer.sourceUri ? assets.find(function (a) {
        return a.uri === layer.sourceUri;
      }) : undefined;
      if (asset && (asset.status !== 'ready' || asset.hasAudio === false)) {
        return "continue";
      }
      var sourceUri = (_asset$uri = asset === null || asset === void 0 ? void 0 : asset.uri) !== null && _asset$uri !== void 0 ? _asset$uri : layer.sourceUri;
      if (!sourceUri) return "continue";
      var timelineStartMs = (0, _timeline.clamp)(layer.startMs, 0, project.durationMs);
      if (timelineStartMs >= project.durationMs) return "continue";
      var maxTimelineDuration = project.durationMs - timelineStartMs;
      var inPointMs = Math.max(0, (_layer$inPointMs = layer.inPointMs) !== null && _layer$inPointMs !== void 0 ? _layer$inPointMs : 0);
      var availableSourceDuration = asset !== null && asset !== void 0 && asset.durationMs && asset.durationMs > inPointMs ? asset.durationMs - inPointMs : layer.durationMs;
      var effectiveDurationMs = (0, _timeline.clamp)(Math.min(layer.durationMs, availableSourceDuration, maxTimelineDuration), 0, maxTimelineDuration);
      if (effectiveDurationMs <= 0) return "continue";
      var outPointMs = inPointMs + effectiveDurationMs;
      var gainEnvelope = [];
      var stepMs = Math.max(50, Math.min(250, Math.floor(effectiveDurationMs / 10) || 50));
      var sumGain = 0;
      var count = 0;
      for (var t = 0; t <= effectiveDurationMs; t += stepMs) {
        var state = (0, _animation.evaluateLayerAtTime)(layer, timelineStartMs + t);
        var g = (0, _timeline.clamp)(state.volume * masterVolume, 0, 4);
        gainEnvelope.push({
          timeMs: t,
          gain: g
        });
        sumGain += g;
        count++;
      }
      var avgGain = count > 0 ? sumGain / count : (0, _timeline.clamp)(((_layer$volume = layer.volume) !== null && _layer$volume !== void 0 ? _layer$volume : 1) * masterVolume, 0, 4);
      if (avgGain <= 0 && gainEnvelope.every(function (e) {
        return e.gain <= 0;
      })) return "continue";
      tracks.push({
        layerId: layer.id,
        layerName: layer.name,
        kind: layer.kind,
        sourceUri: sourceUri,
        startMs: timelineStartMs,
        durationMs: effectiveDurationMs,
        inPointMs: inPointMs,
        outPointMs: outPointMs,
        gain: Number(avgGain.toFixed(4)),
        gainEnvelope: gainEnvelope
      });
    };
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();
      if (_ret === "continue") continue;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return {
    projectDurationMs: project.durationMs,
    sampleRate: sampleRate,
    channels: channels,
    masterVolume: masterVolume,
    masterMuted: masterMuted,
    tracks: tracks
  };
}
function parsePngDimensions(header) {
  if (header.byteLength < 24) return null;
  var view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  var width = view.getUint32(16, false);
  var height = view.getUint32(20, false);
  if (width > 0 && height > 0 && width <= 16384 && height <= 16384) {
    return {
      width: width,
      height: height
    };
  }
  return null;
}
function parseWavMetadata(header, totalFileBytes) {
  if (header.byteLength < 44) return null;
  var view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  var channels = view.getUint16(22, true);
  var sampleRate = view.getUint32(24, true);
  var byteRate = view.getUint32(28, true);
  if (byteRate <= 0 || sampleRate <= 0) return null;
  var payloadBytes = Math.max(0, totalFileBytes - 44);
  var durationMs = Math.max(100, Math.round(payloadBytes / byteRate * 1000));
  return {
    sampleRate: sampleRate,
    channels: channels,
    durationMs: durationMs
  };
}
function validateAndCreateMediaAsset(input) {
  var _input$name, _input$maxBytes, _input$probedMetadata, _input$probedMetadata2, _input$probedMetadata3, _ref, _input$name2, _magic$extension, _width, _height, _durationMs, _input$probedMetadata4, _input$probedMetadata5, _input$probedMetadata6, _input$probedMetadata7;
  var uriCheck = (0, _validation.validateSafeUri)(input.uri);
  if (!uriCheck.safe) {
    throw new Error("Invalid media path: ".concat(uriCheck.reason));
  }
  var magic = (0, _validation.verifyMediaMagicBytes)(input.headerBytes, (_input$name = input.name) !== null && _input$name !== void 0 ? _input$name : input.uri, input.sizeBytes, (_input$maxBytes = input.maxBytes) !== null && _input$maxBytes !== void 0 ? _input$maxBytes : _validation.DEFAULT_MAX_MEDIA_BYTES);
  if (!magic.valid || !magic.kind || !magic.mimeType) {
    var _magic$reason;
    throw new Error((_magic$reason = magic.reason) !== null && _magic$reason !== void 0 ? _magic$reason : 'Unsupported or corrupted media file.');
  }
  var width = (_input$probedMetadata = input.probedMetadata) === null || _input$probedMetadata === void 0 ? void 0 : _input$probedMetadata.width;
  var height = (_input$probedMetadata2 = input.probedMetadata) === null || _input$probedMetadata2 === void 0 ? void 0 : _input$probedMetadata2.height;
  var durationMs = (_input$probedMetadata3 = input.probedMetadata) === null || _input$probedMetadata3 === void 0 ? void 0 : _input$probedMetadata3.durationMs;
  if (magic.extension === 'png' && (!width || !height)) {
    var dims = parsePngDimensions(input.headerBytes);
    if (!dims) {
      throw new Error('Corrupted PNG header: invalid IHDR dimensions.');
    }
    width = dims.width;
    height = dims.height;
  }
  if (magic.extension === 'wav' && !durationMs) {
    var wav = parseWavMetadata(input.headerBytes, input.sizeBytes);
    if (!wav) {
      throw new Error('Corrupted WAV header: invalid sample rate or byte rate.');
    }
    durationMs = wav.durationMs;
  }
  var fileName = (_ref = (_input$name2 = input.name) !== null && _input$name2 !== void 0 ? _input$name2 : input.uri.split('/').pop()) !== null && _ref !== void 0 ? _ref : "".concat(magic.kind, ".").concat((_magic$extension = magic.extension) !== null && _magic$extension !== void 0 ? _magic$extension : 'bin');
  return {
    id: "media-".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2, 7)),
    name: fileName,
    kind: magic.kind,
    uri: input.uri,
    mimeType: magic.mimeType,
    sizeBytes: input.sizeBytes,
    width: magic.kind === 'image' || magic.kind === 'video' ? (_width = width) !== null && _width !== void 0 ? _width : 640 : undefined,
    height: magic.kind === 'image' || magic.kind === 'video' ? (_height = height) !== null && _height !== void 0 ? _height : 360 : undefined,
    durationMs: magic.kind === 'video' || magic.kind === 'audio' ? (_durationMs = durationMs) !== null && _durationMs !== void 0 ? _durationMs : 3000 : undefined,
    fps: magic.kind === 'video' ? (_input$probedMetadata4 = (_input$probedMetadata5 = input.probedMetadata) === null || _input$probedMetadata5 === void 0 ? void 0 : _input$probedMetadata5.fps) !== null && _input$probedMetadata4 !== void 0 ? _input$probedMetadata4 : 30 : undefined,
    hasAudio: magic.kind === 'audio' ? true : magic.kind === 'video' ? (_input$probedMetadata6 = (_input$probedMetadata7 = input.probedMetadata) === null || _input$probedMetadata7 === void 0 ? void 0 : _input$probedMetadata7.hasAudio) !== null && _input$probedMetadata6 !== void 0 ? _input$probedMetadata6 : true : false,
    status: 'ready'
  };
}