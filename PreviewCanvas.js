"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreviewCanvas = PreviewCanvas;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function PreviewCanvas(_ref) {
  var scene = _ref.scene,
    _ref$viewportWidth = _ref.viewportWidth,
    viewportWidth = _ref$viewportWidth === void 0 ? 198 : _ref$viewportWidth,
    _ref$viewportHeight = _ref.viewportHeight,
    viewportHeight = _ref$viewportHeight === void 0 ? 320 : _ref$viewportHeight;
  var scaleX = viewportWidth / Math.max(1, scene.width);
  var scaleY = viewportHeight / Math.max(1, scene.height);
  var unitScale = Math.min(scaleX, scaleY);
  return /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [styles.canvas, {
      width: viewportWidth,
      height: viewportHeight,
      backgroundColor: scene.backgroundColor || '#121629'
    }]
  }, scene.visualNodes.map(function (node) {
    var _node$media, _node$media2, _node$media3, _node$media4, _node$media4$uri, _node$media5;
    var state = node.state;
    var tx = state.x * scaleX;
    var ty = state.y * scaleY;
    var boxW = Math.max(24, Math.round(node.width * unitScale));
    var boxH = Math.max(24, Math.round(node.height * unitScale));
    var transform = [{
      translateX: tx
    }, {
      translateY: ty
    }, {
      scale: state.scale
    }, {
      rotate: "".concat(state.rotation, "deg")
    }];
    if (node.kind === 'text') {
      var _node$fontSize;
      var scaledFont = Math.max(11, Math.round(((_node$fontSize = node.fontSize) !== null && _node$fontSize !== void 0 ? _node$fontSize : 56) * unitScale * 1.4));
      return /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
        key: node.layerId,
        numberOfLines: 4,
        style: [styles.previewText, {
          color: node.color || '#FFFFFF',
          fontSize: scaledFont,
          opacity: state.opacity,
          transform: transform
        }]
      }, node.text || node.name);
    }
    if (node.kind === 'shape') {
      var isCircle = node.shape === 'circle';
      var isRounded = node.shape === 'rounded';
      var borderRadius = isCircle ? Math.max(boxW, boxH) : isRounded ? 18 : 4;
      return /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
        key: node.layerId,
        style: [styles.previewShape, {
          width: boxW,
          height: boxH,
          backgroundColor: node.color || '#8B7CFF',
          borderRadius: borderRadius,
          opacity: state.opacity,
          transform: transform
        }]
      });
    }
    var hasValidMedia = ((_node$media = node.media) === null || _node$media === void 0 ? void 0 : _node$media.hasSource) && ((_node$media2 = node.media) === null || _node$media2 === void 0 ? void 0 : _node$media2.status) === 'ready' && ((_node$media3 = node.media) === null || _node$media3 === void 0 ? void 0 : _node$media3.uri);
    if (node.kind === 'image' && hasValidMedia) {
      return /*#__PURE__*/_react["default"].createElement(_reactNative.Image, {
        key: node.layerId,
        source: {
          uri: node.media.uri
        },
        resizeMode: "cover",
        style: [styles.mediaImage, {
          width: boxW,
          height: boxH,
          opacity: state.opacity,
          transform: transform
        }]
      });
    }
    return /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
      key: node.layerId,
      style: [styles.mediaBox, !hasValidMedia && styles.mediaBoxWarning, {
        width: boxW,
        height: boxH,
        opacity: state.opacity,
        transform: transform
      }]
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: styles.mediaTitle
    }, node.kind === 'image' ? '▧ IMAGE' : '▶ VIDEO', " \xB7 ", node.name), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: styles.mediaSubtitle,
      numberOfLines: 2
    }, hasValidMedia ? "".concat((_node$media4 = node.media) === null || _node$media4 === void 0 ? void 0 : (_node$media4$uri = _node$media4.uri) === null || _node$media4$uri === void 0 ? void 0 : _node$media4$uri.split('/').pop(), " @ ").concat((state.sourceTimeMs / 1000).toFixed(2), "s") : ((_node$media5 = node.media) === null || _node$media5 === void 0 ? void 0 : _node$media5.warning) || 'Media source not assigned'));
  }), scene.visualNodes.length === 0 && /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: styles.emptyText
  }, "No active visual layers at ", (scene.timeMs / 1000).toFixed(2), "s"), scene.audioNodes.length > 0 && /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: styles.audioBadge
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: styles.audioBadgeText
  }, "\u266A ", scene.audioNodes.length, " active audio track(s)")));
}
var styles = _reactNative.StyleSheet.create({
  canvas: {
    borderColor: '#474D68',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 10
  },
  previewText: {
    fontWeight: '900',
    position: 'absolute',
    textAlign: 'center'
  },
  previewShape: {
    position: 'absolute'
  },
  mediaImage: {
    position: 'absolute',
    borderRadius: 6
  },
  mediaBox: {
    position: 'absolute',
    backgroundColor: '#25314D',
    borderWidth: 1,
    borderColor: '#6E85B7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6
  },
  mediaBoxWarning: {
    backgroundColor: '#3B2632',
    borderColor: '#E06C88'
  },
  mediaTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10
  },
  mediaSubtitle: {
    color: '#D0D7E6',
    fontSize: 8,
    marginTop: 3,
    textAlign: 'center'
  },
  emptyText: {
    color: '#9AA4B6',
    fontSize: 11
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
    borderColor: '#8B7CFF'
  },
  audioBadgeText: {
    color: '#DAD5FF',
    fontSize: 9,
    fontWeight: '700'
  }
});