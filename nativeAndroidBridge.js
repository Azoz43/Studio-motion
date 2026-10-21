"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAndroidNativeMediaModule = getAndroidNativeMediaModule;
function getAndroidNativeMediaModule() {
  try {
    var rn = require('react-native');
    if (rn && rn.NativeModules && rn.NativeModules.MotionStudioMedia) {
      return rn.NativeModules.MotionStudioMedia;
    }
  } catch (_unused) {
    // Headless Node environment
  }
  return null;
}