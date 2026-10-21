"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TempFileManager = void 0;
exports.decodeMediaFrameToRgba = decodeMediaFrameToRgba;
exports.exportProjectToMp4 = exportProjectToMp4;
exports.importMediaFileFromDisk = importMediaFileFromDisk;
exports.verifyExportedMp4 = verifyExportedMp4;
var fs = _interopRequireWildcard(require("fs"));
var path = _interopRequireWildcard(require("path"));
var os = _interopRequireWildcard(require("os"));
var _child_process = require("child_process");
var _project = require("../core/project");
var _preview = require("../core/preview");
var _timeline = require("../core/timeline");
var _mediaPipeline = require("./mediaPipeline");
var _softwareRasterizer = require("./softwareRasterizer");
var _validation = require("../security/validation");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var TempFileManager = /*#__PURE__*/function () {
  function TempFileManager() {
    _classCallCheck(this, TempFileManager);
    _defineProperty(this, "createdDirs", []);
  }
  _createClass(TempFileManager, [{
    key: "createTempDir",
    value: function createTempDir() {
      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'motion-studio-';
      var dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
      this.createdDirs.push(dir);
      return dir;
    }
  }, {
    key: "cleanupAll",
    value: function cleanupAll() {
      var _iterator = _createForOfIteratorHelper(this.createdDirs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var dir = _step.value;
          try {
            if (fs.existsSync(dir)) {
              fs.rmSync(dir, {
                recursive: true,
                force: true
              });
            }
          } catch (_unused) {
            // Ignore cleanup errors
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.createdDirs = [];
    }
  }]);
  return TempFileManager;
}();
exports.TempFileManager = TempFileManager;
function importMediaFileFromDisk(filePath, maxBytes) {
  var uriCheck = (0, _validation.validateSafeUri)(filePath);
  if (!uriCheck.safe) {
    throw new Error("Security error: ".concat(uriCheck.reason));
  }
  if (!fs.existsSync(filePath)) {
    throw new Error("Media file does not exist: ".concat((0, _validation.sanitizeLogMessage)(filePath)));
  }
  var stat = fs.statSync(filePath);
  if (!stat.isFile() || stat.size <= 0) {
    throw new Error("Media path is empty or not a regular file: ".concat((0, _validation.sanitizeLogMessage)(filePath)));
  }
  var fd = fs.openSync(filePath, 'r');
  var headerLen = Math.min(stat.size, 64);
  var headerBuf = Buffer.alloc(headerLen);
  try {
    fs.readSync(fd, headerBuf, 0, headerLen, 0);
  } finally {
    fs.closeSync(fd);
  }
  var probedMetadata = {};
  var probe = (0, _child_process.spawnSync)('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', filePath], {
    encoding: 'utf8',
    timeout: 10000
  });
  if (probe.status === 0 && probe.stdout) {
    try {
      var _ref, _ref2, _info$format$duration, _info$format;
      var info = JSON.parse(probe.stdout);
      var streams = Array.isArray(info.streams) ? info.streams : [];
      var vStream = streams.find(function (s) {
        return s.codec_type === 'video';
      });
      var aStream = streams.find(function (s) {
        return s.codec_type === 'audio';
      });
      var durSec = parseFloat((_ref = (_ref2 = (_info$format$duration = (_info$format = info.format) === null || _info$format === void 0 ? void 0 : _info$format.duration) !== null && _info$format$duration !== void 0 ? _info$format$duration : vStream === null || vStream === void 0 ? void 0 : vStream.duration) !== null && _ref2 !== void 0 ? _ref2 : aStream === null || aStream === void 0 ? void 0 : aStream.duration) !== null && _ref !== void 0 ? _ref : '0');
      if (Number.isFinite(durSec) && durSec > 0) {
        probedMetadata.durationMs = Math.round(durSec * 1000);
      }
      if (vStream) {
        if (typeof vStream.width === 'number') probedMetadata.width = vStream.width;
        if (typeof vStream.height === 'number') probedMetadata.height = vStream.height;
        if (typeof vStream.r_frame_rate === 'string' && vStream.r_frame_rate.includes('/')) {
          var _vStream$r_frame_rate = vStream.r_frame_rate.split('/').map(Number),
            _vStream$r_frame_rate2 = _slicedToArray(_vStream$r_frame_rate, 2),
            num = _vStream$r_frame_rate2[0],
            den = _vStream$r_frame_rate2[1];
          if (num > 0 && den > 0) probedMetadata.fps = Math.round(num / den);
        }
      }
      probedMetadata.hasAudio = Boolean(aStream);
    } catch (_unused2) {
      // Fallback to header parser
    }
  }
  var asset = (0, _mediaPipeline.validateAndCreateMediaAsset)({
    uri: filePath,
    name: path.basename(filePath),
    headerBytes: new Uint8Array(headerBuf.buffer, headerBuf.byteOffset, headerBuf.byteLength),
    sizeBytes: stat.size,
    probedMetadata: probedMetadata,
    maxBytes: maxBytes
  });
  if ((asset.kind === 'video' || asset.kind === 'audio') && probe.status !== 0) {
    throw new Error("Corrupted ".concat(asset.kind, " stream structure: media decoder could not read streams."));
  }
  return asset;
}
function decodeMediaFrameToRgba(uri, targetW, targetH) {
  var sourceTimeMs = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  if (!fs.existsSync(uri)) return null;
  var w = Math.max(2, Math.round(targetW));
  var h = Math.max(2, Math.round(targetH));
  var args = ['-v', 'error'];
  if (sourceTimeMs > 0) {
    args.push('-ss', (sourceTimeMs / 1000).toFixed(3));
  }
  args.push('-i', uri, '-frames:v', '1', '-vf', "scale=".concat(w, ":").concat(h), '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1');
  var res = (0, _child_process.spawnSync)('ffmpeg', args, {
    maxBuffer: w * h * 4 + 1024 * 1024,
    timeout: 15000
  });
  if (res.status !== 0 || !res.stdout || res.stdout.byteLength < w * h * 4) {
    return null;
  }
  return {
    width: w,
    height: h,
    data: new Uint8Array(res.stdout.buffer, res.stdout.byteOffset, w * h * 4)
  };
}
function verifyExportedMp4(mp4Path) {
  var _ref3, _parsed$format$durati, _parsed$format, _videoStream$nb_frame, _parsed$format$format, _parsed$format2, _videoStream$codec_na, _audioStream$codec_na, _videoStream$width, _videoStream$height;
  if (!fs.existsSync(mp4Path)) {
    throw new Error("Exported MP4 file not found at ".concat((0, _validation.sanitizeLogMessage)(mp4Path)));
  }
  var stat = fs.statSync(mp4Path);
  if (stat.size < 256) {
    throw new Error("Exported MP4 file is too small (".concat(stat.size, " bytes) to be a valid container."));
  }
  var probe = (0, _child_process.spawnSync)('ffprobe', ['-v', 'error', '-show_entries', 'format=format_name,duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_frames', '-of', 'json', mp4Path], {
    encoding: 'utf8',
    timeout: 10000
  });
  if (probe.status !== 0 || !probe.stdout) {
    throw new Error("ffprobe verification failed: ".concat((0, _validation.sanitizeLogMessage)(probe.stderr || 'unknown error')));
  }
  var parsed = JSON.parse(probe.stdout);
  var streams = Array.isArray(parsed.streams) ? parsed.streams : [];
  var videoStream = streams.find(function (s) {
    return s.codec_type === 'video';
  });
  var audioStream = streams.find(function (s) {
    return s.codec_type === 'audio';
  });
  if (!videoStream) {
    throw new Error('Exported MP4 has no video stream.');
  }
  var fps = 30;
  if (typeof videoStream.r_frame_rate === 'string' && videoStream.r_frame_rate.includes('/')) {
    var _videoStream$r_frame_ = videoStream.r_frame_rate.split('/').map(Number),
      _videoStream$r_frame_2 = _slicedToArray(_videoStream$r_frame_, 2),
      n = _videoStream$r_frame_2[0],
      d = _videoStream$r_frame_2[1];
    if (n > 0 && d > 0) fps = Math.round(n / d);
  }
  var durationSec = parseFloat((_ref3 = (_parsed$format$durati = (_parsed$format = parsed.format) === null || _parsed$format === void 0 ? void 0 : _parsed$format.duration) !== null && _parsed$format$durati !== void 0 ? _parsed$format$durati : videoStream.duration) !== null && _ref3 !== void 0 ? _ref3 : '0');
  var nbFrames = parseInt((_videoStream$nb_frame = videoStream.nb_frames) !== null && _videoStream$nb_frame !== void 0 ? _videoStream$nb_frame : '0', 10) || Math.round(durationSec * fps);
  return {
    valid: true,
    outputPath: mp4Path,
    sizeBytes: stat.size,
    formatName: String((_parsed$format$format = (_parsed$format2 = parsed.format) === null || _parsed$format2 === void 0 ? void 0 : _parsed$format2.format_name) !== null && _parsed$format$format !== void 0 ? _parsed$format$format : 'mp4'),
    videoCodec: String((_videoStream$codec_na = videoStream.codec_name) !== null && _videoStream$codec_na !== void 0 ? _videoStream$codec_na : ''),
    audioCodec: audioStream ? String((_audioStream$codec_na = audioStream.codec_name) !== null && _audioStream$codec_na !== void 0 ? _audioStream$codec_na : '') : undefined,
    width: Number((_videoStream$width = videoStream.width) !== null && _videoStream$width !== void 0 ? _videoStream$width : 0),
    height: Number((_videoStream$height = videoStream.height) !== null && _videoStream$height !== void 0 ? _videoStream$height : 0),
    fps: fps,
    durationSec: durationSec,
    nbFrames: nbFrames,
    hasAudioStream: Boolean(audioStream)
  };
}
function exportProjectToMp4(_x2, _x3) {
  return _exportProjectToMp.apply(this, arguments);
}
function _exportProjectToMp() {
  _exportProjectToMp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(rawProject, options) {
    var tempManager, _options$signal, _ref4, _options$width, _project$exportSettin, _ref5, _options$height, _project$exportSettin2, _ref6, _options$fps, _project$exportSettin3, _options$onProgress, _options$onProgress2, _options$onProgress5, _options$onProgress6, project, outWidth, outHeight, fps, durationSec, totalFrames, scaleX, scaleY, uniformScale, scaledProject, staticDecodedMap, _iterator2, _step2, _loop, audioPlan, validAudioTracks, outputDir, tempDir, tempMp4Path, ffArgs, _project$exportSettin4, _project$exportSettin5, _project$exportSettin6, _project$exportSettin7, _project$exportSettin8, _project$exportSettin9, _project$exportSettin10, _project$exportSettin11, _iterator3, _step3, track, filterParts, mixLabels, bedIdx, verified;
    return _regeneratorRuntime().wrap(function _callee$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          tempManager = new TempFileManager();
          _context2.prev = 1;
          if (!((_options$signal = options.signal) !== null && _options$signal !== void 0 && _options$signal.aborted)) {
            _context2.next = 4;
            break;
          }
          throw new Error('Export cancelled before start.');
        case 4:
          project = (0, _project.validateProject)(rawProject);
          outWidth = Math.max(16, Math.round(((_ref4 = (_options$width = options.width) !== null && _options$width !== void 0 ? _options$width : (_project$exportSettin = project.exportSettings) === null || _project$exportSettin === void 0 ? void 0 : _project$exportSettin.width) !== null && _ref4 !== void 0 ? _ref4 : project.width) / 2) * 2);
          outHeight = Math.max(16, Math.round(((_ref5 = (_options$height = options.height) !== null && _options$height !== void 0 ? _options$height : (_project$exportSettin2 = project.exportSettings) === null || _project$exportSettin2 === void 0 ? void 0 : _project$exportSettin2.height) !== null && _ref5 !== void 0 ? _ref5 : project.height) / 2) * 2);
          fps = (0, _timeline.clamp)(Math.round((_ref6 = (_options$fps = options.fps) !== null && _options$fps !== void 0 ? _options$fps : (_project$exportSettin3 = project.exportSettings) === null || _project$exportSettin3 === void 0 ? void 0 : _project$exportSettin3.fps) !== null && _ref6 !== void 0 ? _ref6 : project.fps), 1, 120);
          durationSec = Math.max(0.1, project.durationMs / 1000);
          totalFrames = Math.max(1, Math.round(durationSec * fps));
          (_options$onProgress = options.onProgress) === null || _options$onProgress === void 0 ? void 0 : _options$onProgress.call(options, {
            percent: 5,
            currentFrame: 0,
            totalFrames: totalFrames,
            stage: 'validating'
          });
          scaleX = outWidth / project.width;
          scaleY = outHeight / project.height;
          uniformScale = Math.min(scaleX, scaleY);
          scaledProject = _objectSpread(_objectSpread({}, project), {}, {
            width: outWidth,
            height: outHeight,
            fps: fps,
            layers: project.layers.map(function (l) {
              return _objectSpread(_objectSpread({}, l), {}, {
                x: l.x * scaleX,
                y: l.y * scaleY,
                width: l.width ? Math.round(l.width * uniformScale) : undefined,
                height: l.height ? Math.round(l.height * uniformScale) : undefined,
                fontSize: l.fontSize ? Math.round(l.fontSize * uniformScale) : undefined,
                keyframes: l.keyframes.map(function (kf) {
                  return _objectSpread(_objectSpread({}, kf), {}, {
                    value: kf.property === 'x' ? kf.value * scaleX : kf.property === 'y' ? kf.value * scaleY : kf.value
                  });
                })
              });
            })
          });
          (_options$onProgress2 = options.onProgress) === null || _options$onProgress2 === void 0 ? void 0 : _options$onProgress2.call(options, {
            percent: 10,
            currentFrame: 0,
            totalFrames: totalFrames,
            stage: 'decoding_media'
          });
          staticDecodedMap = new Map();
          _iterator2 = _createForOfIteratorHelper(scaledProject.layers);
          _context2.prev = 18;
          _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
            var layer, _scaledProject$mediaA, _asset$uri, _ref8, _asset$id, asset, uri, key, _ref9, _layer$width, _ref10, _layer$height, decoded;
            return _regeneratorRuntime().wrap(function _loop$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  layer = _step2.value;
                  if (layer.kind === 'image') {
                    asset = ((_scaledProject$mediaA = scaledProject.mediaAssets) !== null && _scaledProject$mediaA !== void 0 ? _scaledProject$mediaA : []).find(function (a) {
                      return a.id === layer.mediaId;
                    });
                    uri = (_asset$uri = asset === null || asset === void 0 ? void 0 : asset.uri) !== null && _asset$uri !== void 0 ? _asset$uri : layer.sourceUri;
                    key = (_ref8 = (_asset$id = asset === null || asset === void 0 ? void 0 : asset.id) !== null && _asset$id !== void 0 ? _asset$id : uri) !== null && _ref8 !== void 0 ? _ref8 : layer.id;
                    if (uri && !staticDecodedMap.has(key)) {
                      decoded = decodeMediaFrameToRgba(uri, (_ref9 = (_layer$width = layer.width) !== null && _layer$width !== void 0 ? _layer$width : asset === null || asset === void 0 ? void 0 : asset.width) !== null && _ref9 !== void 0 ? _ref9 : 320, (_ref10 = (_layer$height = layer.height) !== null && _layer$height !== void 0 ? _layer$height : asset === null || asset === void 0 ? void 0 : asset.height) !== null && _ref10 !== void 0 ? _ref10 : 240, 0);
                      if (decoded) {
                        staticDecodedMap.set(key, decoded);
                      }
                    }
                  }
                case 2:
                case "end":
                  return _context.stop();
              }
            }, _loop);
          });
          _iterator2.s();
        case 21:
          if ((_step2 = _iterator2.n()).done) {
            _context2.next = 25;
            break;
          }
          return _context2.delegateYield(_loop(), "t0", 23);
        case 23:
          _context2.next = 21;
          break;
        case 25:
          _context2.next = 30;
          break;
        case 27:
          _context2.prev = 27;
          _context2.t1 = _context2["catch"](18);
          _iterator2.e(_context2.t1);
        case 30:
          _context2.prev = 30;
          _iterator2.f();
          return _context2.finish(30);
        case 33:
          audioPlan = (0, _mediaPipeline.computeAudioMixPlan)(scaledProject);
          validAudioTracks = audioPlan.tracks.filter(function (t) {
            return fs.existsSync(t.sourceUri);
          });
          outputDir = path.dirname(options.outputPath);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {
              recursive: true
            });
          }
          tempDir = tempManager.createTempDir('motion-studio-export-');
          tempMp4Path = path.join(tempDir, 'staging_output.mp4');
          ffArgs = ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', "".concat(outWidth, "x").concat(outHeight), '-r', String(fps), '-i', 'pipe:0'];
          if (validAudioTracks.length === 0) {
            ffArgs.push('-f', 'lavfi', '-i', "anullsrc=channel_layout=stereo:sample_rate=".concat(audioPlan.sampleRate));
            ffArgs.push('-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', (_project$exportSettin4 = (_project$exportSettin5 = project.exportSettings) === null || _project$exportSettin5 === void 0 ? void 0 : _project$exportSettin5.preset) !== null && _project$exportSettin4 !== void 0 ? _project$exportSettin4 : 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', "".concat((_project$exportSettin6 = (_project$exportSettin7 = project.exportSettings) === null || _project$exportSettin7 === void 0 ? void 0 : _project$exportSettin7.audioBitrateKbps) !== null && _project$exportSettin6 !== void 0 ? _project$exportSettin6 : 128, "k"), '-t', durationSec.toFixed(3), '-movflags', '+faststart', tempMp4Path);
          } else {
            _iterator3 = _createForOfIteratorHelper(validAudioTracks);
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                track = _step3.value;
                ffArgs.push('-i', track.sourceUri);
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
            filterParts = [];
            mixLabels = [];
            validAudioTracks.forEach(function (track, idx) {
              var inputIdx = idx + 1;
              var inSec = (track.inPointMs / 1000).toFixed(3);
              var durSec = (track.durationMs / 1000).toFixed(3);
              var delayMs = Math.round(track.startMs);
              var label = "a".concat(idx);
              filterParts.push("[".concat(inputIdx, ":a]atrim=start=").concat(inSec, ":duration=").concat(durSec, ",asetpts=PTS-STARTPTS,volume=").concat(track.gain.toFixed(3), ",adelay=").concat(delayMs, "|").concat(delayMs, "[").concat(label, "]"));
              mixLabels.push("[".concat(label, "]"));
            });
            bedIdx = validAudioTracks.length + 1;
            ffArgs.push('-f', 'lavfi', '-t', durationSec.toFixed(3), '-i', "anullsrc=channel_layout=stereo:sample_rate=".concat(audioPlan.sampleRate));
            mixLabels.push("[".concat(bedIdx, ":a]"));
            filterParts.push("".concat(mixLabels.join(''), "amix=inputs=").concat(mixLabels.length, ":duration=longest:dropout_transition=0[aout]"));
            ffArgs.push('-filter_complex', filterParts.join(';'), '-map', '0:v:0', '-map', '[aout]', '-c:v', 'libx264', '-preset', (_project$exportSettin8 = (_project$exportSettin9 = project.exportSettings) === null || _project$exportSettin9 === void 0 ? void 0 : _project$exportSettin9.preset) !== null && _project$exportSettin8 !== void 0 ? _project$exportSettin8 : 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', "".concat((_project$exportSettin10 = (_project$exportSettin11 = project.exportSettings) === null || _project$exportSettin11 === void 0 ? void 0 : _project$exportSettin11.audioBitrateKbps) !== null && _project$exportSettin10 !== void 0 ? _project$exportSettin10 : 128, "k"), '-t', durationSec.toFixed(3), '-movflags', '+faststart', tempMp4Path);
          }
          _context2.next = 43;
          return new Promise(function (resolve, reject) {
            var proc = (0, _child_process.spawn)('ffmpeg', ffArgs, {
              stdio: ['pipe', 'pipe', 'pipe']
            });
            var stderrText = '';
            proc.stderr.on('data', function (chunk) {
              stderrText += String(chunk);
            });
            var onAbort = function onAbort() {
              proc.kill('SIGKILL');
              reject(new Error('Export cancelled by user.'));
            };
            if (options.signal) {
              options.signal.addEventListener('abort', onAbort, {
                once: true
              });
            }
            proc.on('error', function (err) {
              if (options.signal) options.signal.removeEventListener('abort', onAbort);
              reject(err);
            });
            proc.on('close', function (code) {
              if (options.signal) options.signal.removeEventListener('abort', onAbort);
              if (code === 0) resolve();else reject(new Error("FFmpeg encoding failed (exit ".concat(code, "): ").concat((0, _validation.sanitizeLogMessage)(stderrText))));
            });
            var frameBuffer = new Uint8Array(outWidth * outHeight * 4);
            var currentFrame = 0;
            var writeNextFrame = function writeNextFrame() {
              var _options$onProgress4;
              while (currentFrame < totalFrames) {
                var _options$signal2, _options$onProgress3;
                if ((_options$signal2 = options.signal) !== null && _options$signal2 !== void 0 && _options$signal2.aborted) {
                  proc.kill('SIGKILL');
                  return;
                }
                var timeMs = currentFrame / fps * 1000;
                var scene = (0, _preview.evaluateSceneAtTime)(scaledProject, timeMs);
                var frameMediaMap = new Map(staticDecodedMap);
                var _iterator4 = _createForOfIteratorHelper(scene.visualNodes),
                  _step4;
                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var _node$media;
                    var node = _step4.value;
                    if (node.kind === 'video' && (_node$media = node.media) !== null && _node$media !== void 0 && _node$media.hasSource && node.media.uri) {
                      var _ref7, _node$media$asset$id, _node$media$asset;
                      var key = (_ref7 = (_node$media$asset$id = (_node$media$asset = node.media.asset) === null || _node$media$asset === void 0 ? void 0 : _node$media$asset.id) !== null && _node$media$asset$id !== void 0 ? _node$media$asset$id : node.media.uri) !== null && _ref7 !== void 0 ? _ref7 : node.layerId;
                      var decodedVidFrame = decodeMediaFrameToRgba(node.media.uri, node.width, node.height, node.state.sourceTimeMs);
                      if (decodedVidFrame) {
                        frameMediaMap.set(key, decodedVidFrame);
                      }
                    }
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
                (0, _softwareRasterizer.renderSceneToRgba)(scene, frameMediaMap, frameBuffer);
                currentFrame++;
                var pct = 15 + Math.round(currentFrame / totalFrames * 75);
                (_options$onProgress3 = options.onProgress) === null || _options$onProgress3 === void 0 ? void 0 : _options$onProgress3.call(options, {
                  percent: pct,
                  currentFrame: currentFrame,
                  totalFrames: totalFrames,
                  stage: 'rendering_frames'
                });
                var canContinue = proc.stdin.write(Buffer.from(frameBuffer.buffer, frameBuffer.byteOffset, frameBuffer.byteLength));
                if (!canContinue) {
                  proc.stdin.once('drain', writeNextFrame);
                  return;
                }
              }
              (_options$onProgress4 = options.onProgress) === null || _options$onProgress4 === void 0 ? void 0 : _options$onProgress4.call(options, {
                percent: 92,
                currentFrame: totalFrames,
                totalFrames: totalFrames,
                stage: 'muxing_audio'
              });
              proc.stdin.end();
            };
            writeNextFrame();
          });
        case 43:
          (_options$onProgress5 = options.onProgress) === null || _options$onProgress5 === void 0 ? void 0 : _options$onProgress5.call(options, {
            percent: 96,
            currentFrame: totalFrames,
            totalFrames: totalFrames,
            stage: 'verifying'
          });
          verified = verifyExportedMp4(tempMp4Path);
          fs.copyFileSync(tempMp4Path, options.outputPath);
          (_options$onProgress6 = options.onProgress) === null || _options$onProgress6 === void 0 ? void 0 : _options$onProgress6.call(options, {
            percent: 100,
            currentFrame: totalFrames,
            totalFrames: totalFrames,
            stage: 'completed'
          });
          return _context2.abrupt("return", _objectSpread(_objectSpread({}, verified), {}, {
            outputPath: options.outputPath
          }));
        case 48:
          _context2.prev = 48;
          tempManager.cleanupAll();
          return _context2.finish(48);
        case 51:
        case "end":
          return _context2.stop();
      }
    }, _callee, null, [[1,, 48, 51], [18, 27, 30, 33]]);
  }));
  return _exportProjectToMp.apply(this, arguments);
}