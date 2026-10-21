"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = RootLayout;
var _expoRouter = require("expo-router");
var _expoStatusBar = require("expo-status-bar");
function RootLayout() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_expoStatusBar.StatusBar, {
    style: "light"
  }), /*#__PURE__*/React.createElement(_expoRouter.Stack, {
    screenOptions: {
      headerShown: false
    }
  }));
}