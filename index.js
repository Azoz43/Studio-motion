"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = EditorScreen;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _asyncStorage = _interopRequireDefault(require("@react-native-async-storage/async-storage"));
var _project = require("../src/core/project");
var _timeline = require("../src/core/timeline");
var _preview = require("../src/core/preview");
var _PreviewCanvas = require("../src/components/PreviewCanvas");
var _projectStorage = require("../src/storage/projectStorage");
var _nativeAndroidBridge = require("../src/media/nativeAndroidBridge");
var _validation = require("../src/security/validation");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var BG = '#0B0D12',
  PANEL = '#151923',
  PANEL2 = '#202635',
  ACCENT = '#8B7CFF',
  TEXT = '#F2F4F8',
  MUTED = '#9AA4B6';
var kinds = ['text', 'shape', 'image', 'video', 'audio'];
var animatableProps = ['opacity', 'x', 'y', 'scale', 'rotation', 'volume'];
var easingModes = ['linear', 'easeIn', 'easeOut', 'easeInOut', 'cubicBezier', 'step'];
var shapeKinds = ['rectangle', 'circle', 'rounded', 'triangle'];
var storageManager = new _projectStorage.ProjectStorageManager(_asyncStorage["default"]);
function EditorScreen() {
  var _project$layers$0$id, _project$layers$, _project$layers$find, _selected$text, _selected$color, _selected$volume, _selected$volume3, _selected$rotation2;
  var _useState = (0, _react.useState)(function () {
      return (0, _project.makeProject)();
    }),
    _useState2 = _slicedToArray(_useState, 2),
    project = _useState2[0],
    setProject = _useState2[1];
  var _useState3 = (0, _react.useState)((_project$layers$0$id = (_project$layers$ = project.layers[0]) === null || _project$layers$ === void 0 ? void 0 : _project$layers$.id) !== null && _project$layers$0$id !== void 0 ? _project$layers$0$id : ''),
    _useState4 = _slicedToArray(_useState3, 2),
    selectedId = _useState4[0],
    setSelectedId = _useState4[1];
  var _useState5 = (0, _react.useState)('linear'),
    _useState6 = _slicedToArray(_useState5, 2),
    selectedEasing = _useState6[0],
    setSelectedEasing = _useState6[1];
  var _useState7 = (0, _react.useState)(''),
    _useState8 = _slicedToArray(_useState7, 2),
    jsonInput = _useState8[0],
    setJsonInput = _useState8[1];
  var _useState9 = (0, _react.useState)(''),
    _useState10 = _slicedToArray(_useState9, 2),
    mediaUriInput = _useState10[0],
    setMediaUriInput = _useState10[1];
  var _useState11 = (0, _react.useState)('image'),
    _useState12 = _slicedToArray(_useState11, 2),
    mediaKindInput = _useState12[0],
    setMediaKindInput = _useState12[1];
  var _useState13 = (0, _react.useState)(false),
    _useState14 = _slicedToArray(_useState13, 2),
    showImport = _useState14[0],
    setShowImport = _useState14[1];
  var _useState15 = (0, _react.useState)(false),
    _useState16 = _slicedToArray(_useState15, 2),
    showMediaModal = _useState16[0],
    setShowMediaModal = _useState16[1];
  var _useState17 = (0, _react.useState)(false),
    _useState18 = _slicedToArray(_useState17, 2),
    isPlaying = _useState18[0],
    setIsPlaying = _useState18[1];
  var _useState19 = (0, _react.useState)(false),
    _useState20 = _slicedToArray(_useState19, 2),
    loopPlayback = _useState20[0],
    setLoopPlayback = _useState20[1];
  var _useState21 = (0, _react.useState)({
      running: false,
      percent: 0,
      stage: 'idle'
    }),
    _useState22 = _slicedToArray(_useState21, 2),
    exportStatus = _useState22[0],
    setExportStatus = _useState22[1];
  var exportAbortRef = (0, _react.useRef)(null);

  // Restore last opened project on startup (P0 requirement: reopen project after closing app)
  (0, _react.useEffect)(function () {
    var mounted = true;
    storageManager.loadLastOpenedProject().then(function (res) {
      if (mounted && res !== null && res !== void 0 && res.project) {
        var _res$project$layers$, _res$project$layers$2;
        setProject(res.project);
        setSelectedId((_res$project$layers$ = (_res$project$layers$2 = res.project.layers[0]) === null || _res$project$layers$2 === void 0 ? void 0 : _res$project$layers$2.id) !== null && _res$project$layers$ !== void 0 ? _res$project$layers$ : '');
      }
    })["catch"](function () {
      // Fallback to initial blank project if storage is empty
    });
    return function () {
      mounted = false;
    };
  }, []);
  var selected = (_project$layers$find = project.layers.find(function (l) {
    return l.id === selectedId;
  })) !== null && _project$layers$find !== void 0 ? _project$layers$find : project.layers[0];
  var timeLabel = (0, _react.useMemo)(function () {
    return "".concat((project.currentTimeMs / 1000).toFixed(2), "s");
  }, [project.currentTimeMs]);
  var evaluatedScene = (0, _react.useMemo)(function () {
    return (0, _preview.evaluateSceneAtTime)(project, project.currentTimeMs);
  }, [project]);

  // Playback timer synced to project FPS
  (0, _react.useEffect)(function () {
    if (!isPlaying) return;
    var intervalMs = Math.max(16, Math.round(1000 / Math.max(1, project.fps)));
    var startedAt = Date.now();
    var startTime = project.currentTimeMs;
    var timer = setInterval(function () {
      var nextTime = startTime + (Date.now() - startedAt);
      if (nextTime >= project.durationMs) {
        if (loopPlayback) {
          setProject(function (p) {
            return (0, _timeline.movePlayhead)(p, nextTime % Math.max(1, p.durationMs));
          });
        } else {
          setProject(function (p) {
            return (0, _timeline.movePlayhead)(p, p.durationMs);
          });
          setIsPlaying(false);
        }
      } else {
        setProject(function (p) {
          return (0, _timeline.movePlayhead)(p, nextTime);
        });
      }
    }, intervalMs);
    return function () {
      return clearInterval(timer);
    };
  }, [isPlaying, loopPlayback, project.durationMs, project.fps]);
  var updateLayer = function updateLayer(patch) {
    if (!selected || selected.locked) return;
    setProject(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        updatedAt: new Date().toISOString(),
        layers: p.layers.map(function (l) {
          return l.id === selected.id ? _objectSpread(_objectSpread({}, l), patch) : l;
        })
      });
    });
  };
  var persist = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var result;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return storageManager.saveProject(project);
          case 3:
            result = _context.sent;
            _reactNative.Alert.alert('Saved', "Project saved atomically (".concat(result.backedUpPrevious ? 'previous version backed up' : 'initial save', ")."));
            _context.next = 10;
            break;
          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            _reactNative.Alert.alert('Save failed', _context.t0 instanceof Error ? _context.t0.message : 'Could not save project.');
          case 10:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 7]]);
    }));
    return function persist() {
      return _ref.apply(this, arguments);
    };
  }();
  var exportProjectJson = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return _reactNative.Share.share({
              title: "".concat(project.name, ".json"),
              message: (0, _project.serializeProject)(project)
            });
          case 3:
            _context2.next = 8;
            break;
          case 5:
            _context2.prev = 5;
            _context2.t0 = _context2["catch"](0);
            _reactNative.Alert.alert('Export failed', 'Could not open the share sheet.');
          case 8:
          case "end":
            return _context2.stop();
        }
      }, _callee2, null, [[0, 5]]);
    }));
    return function exportProjectJson() {
      return _ref2.apply(this, arguments);
    };
  }();
  var importProjectJson = function importProjectJson() {
    try {
      var _p$layers$0$id, _p$layers$;
      var p = (0, _project.validateProject)(JSON.parse(jsonInput));
      setProject(p);
      setSelectedId((_p$layers$0$id = (_p$layers$ = p.layers[0]) === null || _p$layers$ === void 0 ? void 0 : _p$layers$.id) !== null && _p$layers$0$id !== void 0 ? _p$layers$0$id : '');
      setShowImport(false);
      setJsonInput('');
    } catch (e) {
      _reactNative.Alert.alert('Invalid project', e instanceof Error ? e.message : 'Could not read project JSON.');
    }
  };
  var handleImportMediaAsset = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var _probed$mimeType, _probed$width, _probed$height, _probed$durationMs, _probed$fps;
      var uri, check, _check$reason, nativeModule, probed, asset, next;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            uri = mediaUriInput.trim();
            check = (0, _validation.validateSafeUri)(uri);
            if (check.safe) {
              _context3.next = 5;
              break;
            }
            _reactNative.Alert.alert('Invalid Media URI', (_check$reason = check.reason) !== null && _check$reason !== void 0 ? _check$reason : 'Unsafe file URI.');
            return _context3.abrupt("return");
          case 5:
            nativeModule = (0, _nativeAndroidBridge.getAndroidNativeMediaModule)();
            probed = {};
            if (!nativeModule) {
              _context3.next = 18;
              break;
            }
            _context3.prev = 8;
            _context3.next = 11;
            return nativeModule.probeMedia(uri);
          case 11:
            probed = _context3.sent;
            _context3.next = 18;
            break;
          case 14:
            _context3.prev = 14;
            _context3.t0 = _context3["catch"](8);
            _reactNative.Alert.alert('Media Probe Error', _context3.t0 instanceof Error ? _context3.t0.message : 'Could not read media.');
            return _context3.abrupt("return");
          case 18:
            asset = {
              id: "media-".concat(Date.now().toString(36)),
              name: uri.split('/').pop() || "".concat(mediaKindInput, "-asset"),
              kind: mediaKindInput,
              uri: uri,
              mimeType: (_probed$mimeType = probed.mimeType) !== null && _probed$mimeType !== void 0 ? _probed$mimeType : mediaKindInput === 'image' ? 'image/png' : mediaKindInput === 'video' ? 'video/mp4' : 'audio/mp4',
              sizeBytes: 0,
              width: (_probed$width = probed.width) !== null && _probed$width !== void 0 ? _probed$width : mediaKindInput === 'audio' ? undefined : 640,
              height: (_probed$height = probed.height) !== null && _probed$height !== void 0 ? _probed$height : mediaKindInput === 'audio' ? undefined : 360,
              durationMs: (_probed$durationMs = probed.durationMs) !== null && _probed$durationMs !== void 0 ? _probed$durationMs : mediaKindInput === 'image' ? undefined : project.durationMs,
              fps: (_probed$fps = probed.fps) !== null && _probed$fps !== void 0 ? _probed$fps : 30,
              hasAudio: mediaKindInput !== 'image',
              status: 'ready'
            };
            next = (0, _timeline.addMediaLayer)(project, asset);
            setProject(next);
            setSelectedId(next.layers[next.layers.length - 1].id);
            setMediaUriInput('');
            setShowMediaModal(false);
          case 24:
          case "end":
            return _context3.stop();
        }
      }, _callee3, null, [[8, 14]]);
    }));
    return function handleImportMediaAsset() {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleExportMp4 = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
      var abortCtrl, nativeModule, outputName, res;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            if (!exportStatus.running) {
              _context4.next = 2;
              break;
            }
            return _context4.abrupt("return");
          case 2:
            abortCtrl = new AbortController();
            exportAbortRef.current = abortCtrl;
            setExportStatus({
              running: true,
              percent: 5,
              stage: 'preparing'
            });
            _context4.prev = 5;
            nativeModule = (0, _nativeAndroidBridge.getAndroidNativeMediaModule)();
            outputName = "".concat(project.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'motion_studio', "_").concat(Date.now(), ".mp4");
            if (!nativeModule) {
              _context4.next = 16;
              break;
            }
            _context4.next = 11;
            return nativeModule.exportProjectMp4((0, _project.serializeProject)(project), outputName);
          case 11:
            res = _context4.sent;
            setExportStatus({
              running: false,
              percent: 100,
              stage: 'completed',
              lastOutput: res.outputPath
            });
            _reactNative.Alert.alert('MP4 Export Complete', "Saved to: ".concat(res.outputPath, " (").concat(res.sizeBytes, " bytes)"));
            _context4.next = 18;
            break;
          case 16:
            setExportStatus({
              running: false,
              percent: 0,
              stage: 'idle',
              error: 'Native Android MediaCodec module requires a compiled Android development build (APK).'
            });
            _reactNative.Alert.alert('Export Ready for Native Build', 'In Android APK runtime, MotionStudioMediaModule encodes H.264/AAC via MediaCodec/MediaMuxer. In Node/CLI, run the exporter pipeline.');
          case 18:
            _context4.next = 23;
            break;
          case 20:
            _context4.prev = 20;
            _context4.t0 = _context4["catch"](5);
            setExportStatus({
              running: false,
              percent: 0,
              stage: 'error',
              error: _context4.t0 instanceof Error ? _context4.t0.message : 'Export failed.'
            });
          case 23:
            _context4.prev = 23;
            exportAbortRef.current = null;
            return _context4.finish(23);
          case 26:
          case "end":
            return _context4.stop();
        }
      }, _callee4, null, [[5, 20, 23, 26]]);
    }));
    return function handleExportMp4() {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleCancelExport = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
      var _exportAbortRef$curre;
      var nativeModule;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            (_exportAbortRef$curre = exportAbortRef.current) === null || _exportAbortRef$curre === void 0 ? void 0 : _exportAbortRef$curre.abort();
            nativeModule = (0, _nativeAndroidBridge.getAndroidNativeMediaModule)();
            if (!nativeModule) {
              _context5.next = 5;
              break;
            }
            _context5.next = 5;
            return nativeModule.cancelActiveExport()["catch"](function () {
              return false;
            });
          case 5:
            setExportStatus({
              running: false,
              percent: 0,
              stage: 'cancelled'
            });
          case 6:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return function handleCancelExport() {
      return _ref5.apply(this, arguments);
    };
  }();
  var add = function add(kind) {
    var next = (0, _timeline.addLayer)(project, kind);
    setProject(next);
    setSelectedId(next.layers[next.layers.length - 1].id);
  };
  var addKeyframe = function addKeyframe(property) {
    if (!selected || selected.locked) return;
    var localTimeMs = (0, _timeline.clamp)(project.currentTimeMs - selected.startMs, 0, selected.durationMs);
    var updated = (0, _timeline.addPropertyKeyframe)(selected, localTimeMs, property, undefined, selectedEasing);
    setProject(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        layers: p.layers.map(function (l) {
          return l.id === selected.id ? updated : l;
        })
      });
    });
  };
  var toggleVisibility = function toggleVisibility(layer) {
    return setProject(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        layers: p.layers.map(function (l) {
          return l.id === layer.id ? _objectSpread(_objectSpread({}, l), {}, {
            visible: !l.visible
          }) : l;
        })
      });
    });
  };
  var toggleLock = function toggleLock(layer) {
    return setProject(function (p) {
      return _objectSpread(_objectSpread({}, p), {}, {
        layers: p.layers.map(function (l) {
          return l.id === layer.id ? _objectSpread(_objectSpread({}, l), {}, {
            locked: !l.locked
          }) : l;
        })
      });
    });
  };
  var changeTime = function changeTime(delta) {
    return setProject(function (p) {
      return (0, _timeline.movePlayhead)(p, p.currentTimeMs + delta);
    });
  };
  return /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.root
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.topbar
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, null, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.brand
  }, "MOTION STUDIO v4"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.projectName
  }, project.name)), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.topActions
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: persist
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "Save")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: exportProjectJson
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "Share JSON")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: [s.smallBtn, {
      backgroundColor: ACCENT
    }],
    onPress: handleExportMp4
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "Export MP4")))), /*#__PURE__*/_react["default"].createElement(_reactNative.ScrollView, {
    contentContainerStyle: s.content
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.previewPanel
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.previewHeader
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.sectionTitle
  }, "PREVIEW"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.meta
  }, project.width, " \xD7 ", project.height, " \xB7 ", project.fps, " FPS \xB7 Frame #", evaluatedScene.frameIndex)), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.canvasOuter
  }, /*#__PURE__*/_react["default"].createElement(_PreviewCanvas.PreviewCanvas, {
    scene: evaluatedScene
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.playheadRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      setProject(function (p) {
        return (0, _timeline.movePlayhead)(p, 0);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "|\u25C0")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      setProject(function (p) {
        return (0, _timeline.stepFrame)(p, -1);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "\u22121f")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      changeTime(-100);
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "\u2212100ms")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: [s.transport, isPlaying && {
      backgroundColor: ACCENT
    }],
    onPress: function onPress() {
      if (project.currentTimeMs >= project.durationMs) setProject(function (p) {
        return (0, _timeline.movePlayhead)(p, 0);
      });
      setIsPlaying(function (v) {
        return !v;
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, isPlaying ? '❚❚' : '▶')), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.time
  }, timeLabel), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      changeTime(100);
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "+100ms")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      setProject(function (p) {
        return (0, _timeline.stepFrame)(p, 1);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "+1f")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: [s.transport, loopPlayback && {
      borderColor: ACCENT,
      borderWidth: 1
    }],
    onPress: function onPress() {
      return setLoopPlayback(function (v) {
        return !v;
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "\u21BB")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.transport,
    onPress: function onPress() {
      setIsPlaying(false);
      setProject(function (p) {
        return (0, _timeline.movePlayhead)(p, p.durationMs);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.transportText
  }, "\u25B6|")))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.panel
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.sectionTitle
  }, "TIMELINE \xB7 ", project.layers.length, " LAYERS"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.meta
  }, (project.durationMs / 1000).toFixed(1), "s")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.ruler
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.rulerText
  }, "0s"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.rulerText
  }, (project.durationMs / 4000).toFixed(1), "s"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.rulerText
  }, (project.durationMs / 2000).toFixed(1), "s"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.rulerText
  }, (project.durationMs * 3 / 4000).toFixed(1), "s"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.rulerText
  }, (project.durationMs / 1000).toFixed(1), "s")), project.layers.map(function (layer, index) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: layer.id,
      onPress: function onPress() {
        return setSelectedId(layer.id);
      },
      style: [s.layerRow, (selected === null || selected === void 0 ? void 0 : selected.id) === layer.id && s.layerSelected]
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
      style: s.layerMeta
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.layerIndex
    }, String(index + 1).padStart(2, '0')), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.layerName
    }, layer.name, " ", layer.locked ? '🔒' : ''), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.layerKind
    }, layer.kind.toUpperCase(), " \xB7 ", (layer.startMs / 1000).toFixed(1), "s\u2013", ((layer.startMs + layer.durationMs) / 1000).toFixed(1), "s")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      onPress: function onPress() {
        return toggleLock(layer);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.eye
    }, layer.locked ? '🔒' : '🔓')), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      onPress: function onPress() {
        return toggleVisibility(layer);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.eye
    }, layer.visible ? '◉' : '○'))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
      style: s.track
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
      style: [s.clip, layer.kind === 'audio' && {
        backgroundColor: '#2E9B78'
      }, {
        left: "".concat(layer.startMs / Math.max(1, project.durationMs) * 100, "%"),
        width: "".concat(layer.durationMs / Math.max(1, project.durationMs) * 100, "%")
      }]
    }, layer.keyframes.map(function (k) {
      return /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
        key: k.id,
        style: [s.diamond, {
          left: "".concat(k.timeMs / Math.max(layer.durationMs, 1) * 100, "%")
        }]
      });
    }))));
  }), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, kinds.map(function (k) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: k,
      style: s.addBtn,
      onPress: function onPress() {
        return add(k);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, "\uFF0B ", k));
  }), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: [s.addBtn, {
      backgroundColor: '#2A3B5C'
    }],
    onPress: function onPress() {
      return setShowMediaModal(function (v) {
        return !v;
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.addBtnText
  }, "\uD83D\uDCE5 Import Media File"))), showMediaModal && /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: {
      gap: 8,
      marginTop: 6
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, ['image', 'video', 'audio'].map(function (mk) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: mk,
      style: [s.addBtn, mediaKindInput === mk && {
        backgroundColor: ACCENT
      }],
      onPress: function onPress() {
        return setMediaKindInput(mk);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, mk.toUpperCase()));
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TextInput, {
    value: mediaUriInput,
    onChangeText: setMediaUriInput,
    placeholder: "file:///path/to/media.mp4 or content://...",
    placeholderTextColor: MUTED,
    style: s.input,
    autoCapitalize: "none"
  }), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.primaryBtn,
    onPress: handleImportMediaAsset
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.primaryText
  }, "Validate & Add Media Layer")))), selected && /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.panel
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.sectionTitle
  }, "LAYER PROPERTIES \xB7 ", selected.kind.toUpperCase()), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: function onPress() {
      return setProject(function (p) {
        return (0, _timeline.moveLayerOrder)(p, selected.id, 'up');
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "\u2191 Up")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: function onPress() {
      return setProject(function (p) {
        return (0, _timeline.moveLayerOrder)(p, selected.id, 'down');
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "\u2193 Down")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: function onPress() {
      return setProject(function (p) {
        return (0, _timeline.duplicateLayer)(p, selected.id);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "Copy")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.smallBtn,
    onPress: function onPress() {
      return setProject(function (p) {
        return (0, _timeline.splitLayerAtTime)(p, selected.id, p.currentTimeMs);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.smallBtnText
  }, "\u2702 Split")), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: [s.smallBtn, {
      backgroundColor: '#48232E'
    }],
    onPress: function onPress() {
      return setProject(function (p) {
        return (0, _timeline.removeLayer)(p, selected.id);
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: [s.smallBtnText, {
      color: '#FF8C9D'
    }]
  }, "Delete")))), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Layer name"), /*#__PURE__*/_react["default"].createElement(_reactNative.TextInput, {
    value: selected.name,
    onChangeText: function onChangeText(name) {
      return updateLayer({
        name: name
      });
    },
    style: s.input,
    placeholderTextColor: MUTED
  }), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Start Offset"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, (selected.startMs / 1000).toFixed(2), "s")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer((0, _timeline.trimLayer)(selected, selected.startMs - 250, selected.durationMs, selected.inPointMs, project.durationMs));
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat(selected.startMs / Math.max(1, project.durationMs) * 100, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer((0, _timeline.trimLayer)(selected, selected.startMs + 250, selected.durationMs, selected.inPointMs, project.durationMs));
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Clip Duration"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, (selected.durationMs / 1000).toFixed(2), "s")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer((0, _timeline.trimLayer)(selected, selected.startMs, selected.durationMs - 250, selected.inPointMs, project.durationMs));
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat(selected.durationMs / Math.max(1, project.durationMs) * 100, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer((0, _timeline.trimLayer)(selected, selected.startMs, selected.durationMs + 250, selected.inPointMs, project.durationMs));
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), selected.kind === 'text' && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Text content"), /*#__PURE__*/_react["default"].createElement(_reactNative.TextInput, {
    value: (_selected$text = selected.text) !== null && _selected$text !== void 0 ? _selected$text : '',
    onChangeText: function onChangeText(text) {
      return updateLayer({
        text: text
      });
    },
    style: s.input,
    placeholder: "Enter text",
    placeholderTextColor: MUTED
  })), (selected.kind === 'text' || selected.kind === 'shape') && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Color (hex)"), /*#__PURE__*/_react["default"].createElement(_reactNative.TextInput, {
    value: (_selected$color = selected.color) !== null && _selected$color !== void 0 ? _selected$color : '#FFFFFF',
    onChangeText: function onChangeText(color) {
      return updateLayer({
        color: color.startsWith('#') ? color : "#".concat(color)
      });
    },
    style: s.input,
    autoCapitalize: "characters",
    placeholder: "#FFFFFF",
    placeholderTextColor: MUTED
  }), selected.kind === 'shape' && /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, shapeKinds.map(function (sk) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: sk,
      style: [s.addBtn, selected.shape === sk && {
        backgroundColor: ACCENT
      }],
      onPress: function onPress() {
        return updateLayer({
          shape: sk
        });
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, sk));
  }))), (selected.kind === 'video' || selected.kind === 'audio') && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Audio Volume"), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    onPress: function onPress() {
      return updateLayer({
        muted: !selected.muted
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, selected.muted ? 'MUTED 🔇' : "".concat(Math.round(((_selected$volume = selected.volume) !== null && _selected$volume !== void 0 ? _selected$volume : 1) * 100), "% \uD83D\uDD0A")))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      var _selected$volume2;
      return updateLayer({
        volume: (0, _timeline.clamp)(((_selected$volume2 = selected.volume) !== null && _selected$volume2 !== void 0 ? _selected$volume2 : 1) - 0.1, 0, 2)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat(((_selected$volume3 = selected.volume) !== null && _selected$volume3 !== void 0 ? _selected$volume3 : 1) / 2 * 100, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      var _selected$volume4;
      return updateLayer({
        volume: (0, _timeline.clamp)(((_selected$volume4 = selected.volume) !== null && _selected$volume4 !== void 0 ? _selected$volume4 : 1) + 0.1, 0, 2)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B")))), selected.kind !== 'audio' && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Opacity"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, Math.round(selected.opacity * 100), "%")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        opacity: (0, _timeline.clamp)(selected.opacity - 0.1, 0, 1)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat(selected.opacity * 100, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        opacity: (0, _timeline.clamp)(selected.opacity + 0.1, 0, 1)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Scale"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, selected.scale.toFixed(1), "\xD7")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        scale: (0, _timeline.clamp)(selected.scale - 0.1, 0.1, 5)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat(selected.scale / 5 * 100, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        scale: (0, _timeline.clamp)(selected.scale + 0.1, 0.1, 5)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Position X"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, Math.round(selected.x), " px")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        x: (0, _timeline.clamp)(selected.x - 10, -1000, 1000)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat((selected.x + 1000) / 20, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        x: (0, _timeline.clamp)(selected.x + 10, -1000, 1000)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Position Y"), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, Math.round(selected.y), " px")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.sliderRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        y: (0, _timeline.clamp)(selected.y - 10, -1000, 1000)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.fakeSlider
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: [s.fakeFill, {
      width: "".concat((selected.y + 1000) / 20, "%")
    }]
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      return updateLayer({
        y: (0, _timeline.clamp)(selected.y + 10, -1000, 1000)
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Rotation"), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      var _selected$rotation;
      return updateLayer({
        rotation: ((_selected$rotation = selected.rotation) !== null && _selected$rotation !== void 0 ? _selected$rotation : 0) - 5
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\u2212")), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.value
  }, (_selected$rotation2 = selected.rotation) !== null && _selected$rotation2 !== void 0 ? _selected$rotation2 : 0, "\xB0"), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.adjust,
    onPress: function onPress() {
      var _selected$rotation3;
      return updateLayer({
        rotation: ((_selected$rotation3 = selected.rotation) !== null && _selected$rotation3 !== void 0 ? _selected$rotation3 : 0) + 5
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.adjustText
  }, "\uFF0B"))))), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Keyframe Easing Mode"), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, easingModes.map(function (em) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: em,
      style: [s.addBtn, selectedEasing === em && {
        backgroundColor: ACCENT
      }],
      onPress: function onPress() {
        return setSelectedEasing(em);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, em));
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Add keyframe at ", timeLabel, " (", selectedEasing, ")"), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, animatableProps.map(function (property) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: property,
      style: s.keyBtn,
      onPress: function onPress() {
        return addKeyframe(property);
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.keyBtnText
    }, "\uFF0B ", property));
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.hint
  }, selected.keyframes.length, " keyframes \xB7 Supports opacity, X, Y, scale, rotation & volume with Linear, Ease & Cubic-Bezier interpolation.")), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.panel
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.rowBetween
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.sectionTitle
  }, "PROJECT & EXPORT SETTINGS"), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    onPress: function onPress() {
      var _fresh$layers$0$id, _fresh$layers$;
      var fresh = (0, _project.makeProject)();
      setProject(fresh);
      setSelectedId((_fresh$layers$0$id = (_fresh$layers$ = fresh.layers[0]) === null || _fresh$layers$ === void 0 ? void 0 : _fresh$layers$.id) !== null && _fresh$layers$0$id !== void 0 ? _fresh$layers$0$id : '');
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.danger
  }, "New project"))), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, [{
    label: '720p Vertical',
    w: 720,
    h: 1280
  }, {
    label: '1080p Vertical',
    w: 1080,
    h: 1920
  }, {
    label: '1080p Landscape',
    w: 1920,
    h: 1080
  }].map(function (preset) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: preset.label,
      style: [s.addBtn, project.width === preset.w && project.height === preset.h && {
        backgroundColor: ACCENT
      }],
      onPress: function onPress() {
        return setProject(function (p) {
          var _p$exportSettings;
          return _objectSpread(_objectSpread({}, p), {}, {
            width: preset.w,
            height: preset.h,
            exportSettings: _objectSpread(_objectSpread({}, (_p$exportSettings = p.exportSettings) !== null && _p$exportSettings !== void 0 ? _p$exportSettings : {}), {}, {
              width: preset.w,
              height: preset.h
            })
          });
        });
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, preset.label));
  })), /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: s.addRow
  }, [24, 30, 60].map(function (fpsOpt) {
    return /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
      key: fpsOpt,
      style: [s.addBtn, project.fps === fpsOpt && {
        backgroundColor: ACCENT
      }],
      onPress: function onPress() {
        return setProject(function (p) {
          var _p$exportSettings2;
          return _objectSpread(_objectSpread({}, p), {}, {
            fps: fpsOpt,
            exportSettings: _objectSpread(_objectSpread({}, (_p$exportSettings2 = p.exportSettings) !== null && _p$exportSettings2 !== void 0 ? _p$exportSettings2 : {}), {}, {
              fps: fpsOpt
            })
          });
        });
      }
    }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
      style: s.addBtnText
    }, fpsOpt, " FPS"));
  })), exportStatus.running && /*#__PURE__*/_react["default"].createElement(_reactNative.View, {
    style: {
      gap: 6
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.label
  }, "Exporting MP4 (", exportStatus.stage, ") \xB7 ", exportStatus.percent, "%"), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.secondaryBtn,
    onPress: handleCancelExport
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: [s.secondaryBtnText, {
      color: '#FF8C9D'
    }]
  }, "Cancel Export"))), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.secondaryBtn,
    onPress: function onPress() {
      return setShowImport(function (v) {
        return !v;
      });
    }
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.secondaryBtnText
  }, showImport ? 'Cancel JSON import' : 'Import project JSON (v1 or v2)')), showImport && /*#__PURE__*/_react["default"].createElement(_react["default"].Fragment, null, /*#__PURE__*/_react["default"].createElement(_reactNative.TextInput, {
    multiline: true,
    value: jsonInput,
    onChangeText: setJsonInput,
    placeholder: "Paste a Motion Studio project JSON here",
    placeholderTextColor: MUTED,
    style: [s.input, s.jsonInput],
    autoCapitalize: "none"
  }), /*#__PURE__*/_react["default"].createElement(_reactNative.TouchableOpacity, {
    style: s.primaryBtn,
    onPress: importProjectJson
  }, /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.primaryText
  }, "Validate & import")))), /*#__PURE__*/_react["default"].createElement(_reactNative.Text, {
    style: s.footer
  }, "Motion Studio v4 \xB7 Clean-room independent engine \xB7 Schema v2 (v1 compatible)")));
}
var s = _reactNative.StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG
  },
  topbar: {
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#242A38',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    color: ACCENT,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '900'
  },
  projectName: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4
  },
  topActions: {
    flexDirection: 'row',
    gap: 6
  },
  smallBtn: {
    backgroundColor: PANEL2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9
  },
  smallBtnText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '700'
  },
  content: {
    padding: 14,
    gap: 12,
    paddingBottom: 40
  },
  previewPanel: {
    backgroundColor: PANEL,
    borderRadius: 16,
    padding: 12
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1
  },
  meta: {
    color: MUTED,
    fontSize: 10
  },
  canvasOuter: {
    alignItems: 'center',
    paddingVertical: 4
  },
  playheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 4
  },
  transport: {
    padding: 7,
    backgroundColor: PANEL2,
    borderRadius: 8
  },
  transportText: {
    color: TEXT,
    fontSize: 10,
    fontWeight: '700'
  },
  time: {
    color: ACCENT,
    fontWeight: '900',
    fontVariant: ['tabular-nums']
  },
  panel: {
    backgroundColor: PANEL,
    borderRadius: 16,
    padding: 13,
    gap: 10
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  ruler: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 5,
    paddingRight: 4,
    marginTop: 3
  },
  rulerText: {
    color: MUTED,
    fontSize: 9
  },
  layerRow: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#11151E',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 8
  },
  layerSelected: {
    borderColor: ACCENT,
    backgroundColor: '#1A1A2A'
  },
  layerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  layerIndex: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: '900'
  },
  layerName: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '700'
  },
  layerKind: {
    color: MUTED,
    fontSize: 8,
    marginTop: 2
  },
  eye: {
    color: TEXT,
    fontSize: 15,
    paddingHorizontal: 4
  },
  track: {
    height: 18,
    backgroundColor: '#252B3A',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative'
  },
  clip: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 4,
    backgroundColor: '#7567E8',
    minWidth: 5
  },
  diamond: {
    width: 7,
    height: 7,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 3,
    marginLeft: -3,
    transform: [{
      rotate: '45deg'
    }]
  },
  addRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: PANEL2,
    borderRadius: 9
  },
  addBtnText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize'
  },
  label: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700'
  },
  value: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '900'
  },
  input: {
    backgroundColor: '#0D1119',
    color: TEXT,
    borderWidth: 1,
    borderColor: '#303748',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 12
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  adjust: {
    backgroundColor: PANEL2,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  adjustText: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 18
  },
  fakeSlider: {
    height: 6,
    flex: 1,
    backgroundColor: '#303748',
    borderRadius: 4,
    overflow: 'hidden'
  },
  fakeFill: {
    height: 6,
    backgroundColor: ACCENT,
    borderRadius: 4
  },
  keyBtn: {
    backgroundColor: '#312A55',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8
  },
  keyBtnText: {
    color: '#DAD5FF',
    fontSize: 10,
    fontWeight: '800'
  },
  hint: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 16
  },
  secondaryBtn: {
    backgroundColor: PANEL2,
    padding: 11,
    borderRadius: 9,
    alignItems: 'center'
  },
  secondaryBtnText: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '800'
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    padding: 11,
    borderRadius: 9,
    alignItems: 'center'
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11
  },
  jsonInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'monospace'
  },
  danger: {
    color: '#FF8C9D',
    fontSize: 10,
    fontWeight: '800'
  },
  footer: {
    textAlign: 'center',
    color: '#5E6678',
    fontSize: 9,
    paddingVertical: 5
  }
});