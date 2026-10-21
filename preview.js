"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaybackController = void 0;
exports.evaluateSceneAtTime = evaluateSceneAtTime;
exports.resolveLayerMedia = resolveLayerMedia;
var _animation = require("./animation");
var _project = require("./project");
var _timeline = require("./timeline");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function resolveLayerMedia(layer, project) {
  var _project$mediaAssets;
  if (layer.kind !== 'image' && layer.kind !== 'video' && layer.kind !== 'audio') {
    return {
      hasSource: true,
      status: 'ready'
    };
  }
  var assets = (_project$mediaAssets = project.mediaAssets) !== null && _project$mediaAssets !== void 0 ? _project$mediaAssets : [];
  var asset = layer.mediaId ? assets.find(function (a) {
    return a.id === layer.mediaId;
  }) : layer.sourceUri ? assets.find(function (a) {
    return a.uri === layer.sourceUri;
  }) : undefined;
  if (asset) {
    if (asset.status !== 'ready') {
      var _asset$errorMessage;
      return {
        hasSource: false,
        uri: asset.uri,
        asset: asset,
        status: asset.status,
        warning: (_asset$errorMessage = asset.errorMessage) !== null && _asset$errorMessage !== void 0 ? _asset$errorMessage : "Media asset \"".concat(asset.name, "\" is ").concat(asset.status, ".")
      };
    }
    return {
      hasSource: true,
      uri: asset.uri,
      asset: asset,
      status: 'ready'
    };
  }
  if (layer.sourceUri && layer.sourceUri.trim().length > 0) {
    return {
      hasSource: true,
      uri: layer.sourceUri.trim(),
      status: 'ready'
    };
  }
  return {
    hasSource: false,
    status: 'unassigned',
    warning: "Layer \"".concat(layer.name, "\" (").concat(layer.kind, ") has no assigned media source.")
  };
}
function evaluateSceneAtTime(project, timeMs) {
  var _project$backgroundCo, _project$audioSetting, _project$audioSetting2, _project$audioSetting3, _project$audioSetting4;
  var evalTimeMs = (0, _timeline.clamp)(timeMs !== undefined ? timeMs : project.currentTimeMs, 0, project.durationMs);
  var fps = Math.max(1, project.fps || 30);
  var frameIndex = Math.round(evalTimeMs / 1000 * fps);
  var backgroundColor = (_project$backgroundCo = project.backgroundColor) !== null && _project$backgroundCo !== void 0 ? _project$backgroundCo : _project.DEFAULT_BG_COLOR;
  var masterMuted = (_project$audioSetting = (_project$audioSetting2 = project.audioSettings) === null || _project$audioSetting2 === void 0 ? void 0 : _project$audioSetting2.muted) !== null && _project$audioSetting !== void 0 ? _project$audioSetting : false;
  var masterVolume = (0, _timeline.clamp)((_project$audioSetting3 = (_project$audioSetting4 = project.audioSettings) === null || _project$audioSetting4 === void 0 ? void 0 : _project$audioSetting4.masterVolume) !== null && _project$audioSetting3 !== void 0 ? _project$audioSetting3 : 1, 0, 2);
  var visualNodes = [];
  var audioNodes = [];
  var warnings = [];
  for (var i = project.layers.length - 1; i >= 0; i--) {
    var layer = project.layers[i];
    var state = (0, _animation.evaluateLayerAtTime)(layer, evalTimeMs);
    if (!state.active || !layer.visible) {
      continue;
    }
    var media = resolveLayerMedia(layer, project);
    if (media.warning) {
      warnings.push(media.warning);
    }
    if (layer.kind !== 'audio' && state.opacity > 0) {
      var _ref, _layer$width, _media$asset, _ref2, _layer$height, _media$asset2, _layer$color, _layer$fontSize, _layer$shape;
      var defaultW = layer.kind === 'shape' ? 240 : layer.kind === 'text' ? 600 : 480;
      var defaultH = layer.kind === 'shape' ? 240 : layer.kind === 'text' ? 120 : 320;
      visualNodes.push({
        layerId: layer.id,
        name: layer.name,
        kind: layer.kind,
        paintOrder: visualNodes.length,
        timelineIndex: i,
        state: state,
        width: (_ref = (_layer$width = layer.width) !== null && _layer$width !== void 0 ? _layer$width : (_media$asset = media.asset) === null || _media$asset === void 0 ? void 0 : _media$asset.width) !== null && _ref !== void 0 ? _ref : defaultW,
        height: (_ref2 = (_layer$height = layer.height) !== null && _layer$height !== void 0 ? _layer$height : (_media$asset2 = media.asset) === null || _media$asset2 === void 0 ? void 0 : _media$asset2.height) !== null && _ref2 !== void 0 ? _ref2 : defaultH,
        color: (_layer$color = layer.color) !== null && _layer$color !== void 0 ? _layer$color : layer.kind === 'shape' ? '#8B7CFF' : '#FFFFFF',
        text: layer.kind === 'text' ? layer.text || layer.name : undefined,
        fontSize: layer.kind === 'text' ? (_layer$fontSize = layer.fontSize) !== null && _layer$fontSize !== void 0 ? _layer$fontSize : 56 : undefined,
        shape: layer.kind === 'shape' ? (_layer$shape = layer.shape) !== null && _layer$shape !== void 0 ? _layer$shape : 'rectangle' : undefined,
        media: layer.kind === 'image' || layer.kind === 'video' ? media : undefined
      });
    }
    if (layer.kind === 'audio' || layer.kind === 'video') {
      var hasAudioTrack = layer.kind === 'audio' || (media.asset ? media.asset.hasAudio !== false : true);
      if (hasAudioTrack) {
        var effectiveGain = masterMuted || layer.muted || !media.hasSource ? 0 : (0, _timeline.clamp)(state.volume * masterVolume, 0, 4);
        audioNodes.push({
          layerId: layer.id,
          name: layer.name,
          kind: layer.kind,
          timelineIndex: i,
          localTimeMs: state.localTimeMs,
          sourceTimeMs: state.sourceTimeMs,
          layerVolume: state.volume,
          effectiveGain: effectiveGain,
          muted: Boolean(masterMuted || layer.muted),
          media: media
        });
      }
    }
  }
  return {
    projectId: project.id,
    width: project.width,
    height: project.height,
    fps: fps,
    durationMs: project.durationMs,
    timeMs: evalTimeMs,
    frameIndex: frameIndex,
    backgroundColor: backgroundColor,
    visualNodes: visualNodes,
    audioNodes: audioNodes,
    warnings: warnings
  };
}
var PlaybackController = /*#__PURE__*/function () {
  function PlaybackController() {
    _classCallCheck(this, PlaybackController);
    _defineProperty(this, "state", {
      isPlaying: false,
      loop: false,
      playbackRate: 1
    });
  }
  _createClass(PlaybackController, [{
    key: "getState",
    value: function getState() {
      return _objectSpread({}, this.state);
    }
  }, {
    key: "play",
    value: function play(project) {
      var nextProject = project.currentTimeMs >= project.durationMs ? (0, _timeline.movePlayhead)(project, 0) : project;
      this.state.isPlaying = true;
      return {
        project: nextProject,
        state: this.getState()
      };
    }
  }, {
    key: "pause",
    value: function pause() {
      this.state.isPlaying = false;
      return this.getState();
    }
  }, {
    key: "toggleLoop",
    value: function toggleLoop() {
      this.state.loop = !this.state.loop;
      return this.getState();
    }
  }, {
    key: "seek",
    value: function seek(project, timeMs) {
      return (0, _timeline.movePlayhead)(project, timeMs);
    }
  }, {
    key: "step",
    value: function step(project, deltaFrames) {
      this.state.isPlaying = false;
      return (0, _timeline.stepFrame)(project, deltaFrames);
    }
  }, {
    key: "tick",
    value: function tick(project, elapsedWallMs) {
      if (!this.state.isPlaying) {
        return {
          project: project,
          state: this.getState()
        };
      }
      var deltaMs = Math.max(0, elapsedWallMs * this.state.playbackRate);
      var rawNext = project.currentTimeMs + deltaMs;
      if (rawNext >= project.durationMs) {
        if (this.state.loop) {
          var wrapped = project.durationMs > 0 ? rawNext % project.durationMs : 0;
          return {
            project: (0, _timeline.movePlayhead)(project, wrapped),
            state: this.getState()
          };
        }
        this.state.isPlaying = false;
        return {
          project: (0, _timeline.movePlayhead)(project, project.durationMs),
          state: this.getState()
        };
      }
      return {
        project: (0, _timeline.movePlayhead)(project, rawNext),
        state: this.getState()
      };
    }
  }]);
  return PlaybackController;
}();
exports.PlaybackController = PlaybackController;