"use strict";

var assert = _interopRequireWildcard(require("assert"));
var fs = _interopRequireWildcard(require("fs"));
var path = _interopRequireWildcard(require("path"));
var _child_process = require("child_process");
var _project = require("../src/core/project");
var _timeline = require("../src/core/timeline");
var _animation = require("../src/core/animation");
var _preview = require("../src/core/preview");
var _projectStorage = require("../src/storage/projectStorage");
var _mediaPipeline = require("../src/media/mediaPipeline");
var _exporter = require("../src/media/exporter");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var results = [];
function runTest(_x, _x2, _x3) {
  return _runTest.apply(this, arguments);
}
function _runTest() {
  _runTest = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(id, name, fn) {
    var started, evidence, elapsed, _elapsed, msg;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          started = Date.now();
          _context.prev = 1;
          _context.next = 4;
          return fn();
        case 4:
          evidence = _context.sent;
          elapsed = Date.now() - started;
          results.push({
            id: id,
            name: name,
            status: 'PASS',
            evidence: evidence,
            durationMs: elapsed
          });
          console.log("[PASS] ".concat(id, " - ").concat(name, " (").concat(elapsed, "ms)\n       Evidence: ").concat(evidence));
          _context.next = 16;
          break;
        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](1);
          _elapsed = Date.now() - started;
          msg = _context.t0 instanceof Error ? _context.t0.stack || _context.t0.message : String(_context.t0);
          results.push({
            id: id,
            name: name,
            status: 'FAIL',
            evidence: msg,
            durationMs: _elapsed
          });
          console.error("[FAIL] ".concat(id, " - ").concat(name, " (").concat(_elapsed, "ms)\n       Reason: ").concat(msg));
        case 16:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[1, 10]]);
  }));
  return _runTest.apply(this, arguments);
}
function generateTestMediaFixtures(dir) {
  fs.mkdirSync(dir, {
    recursive: true
  });
  var imagePath = path.join(dir, 'fixture_badge.png');
  var videoPath = path.join(dir, 'fixture_clip.mp4');
  var audioPath = path.join(dir, 'fixture_tone.wav');
  var corruptPath = path.join(dir, 'corrupt_file.mp4');
  (0, _child_process.spawnSync)('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=#00E5A3:s=120x80:d=1', '-frames:v', '1', imagePath]);
  (0, _child_process.spawnSync)('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=30:duration=2.5', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100:duration=2.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', videoPath]);
  (0, _child_process.spawnSync)('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=528:sample_rate=44100:duration=3.0', audioPath]);
  fs.writeFileSync(corruptPath, Buffer.from('NOT_A_VALID_MP4_HEADER_DATA_0000'));
  return {
    imagePath: imagePath,
    videoPath: videoPath,
    audioPath: audioPath,
    corruptPath: corruptPath
  };
}
function main() {
  return _main.apply(this, arguments);
}
function _main() {
  _main = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
    var tempMgr, fixtureDir, fixtures, exportedMp4Path, failed, reportPath;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          tempMgr = new _exporter.TempFileManager();
          fixtureDir = tempMgr.createTempDir('motion-studio-fixtures-');
          fixtures = generateTestMediaFixtures(fixtureDir); // UT-01: Layer position & transform calculation at specific time t
          _context4.next = 5;
          return runTest('UT-01', 'حساب موضع طبقة وتحويلاتها عند زمن معين (Layer position at time t)', function () {
            var layer = (0, _project.makeLayer)('shape', 1, {
              startMs: 500,
              durationMs: 2000,
              x: -100,
              y: 50,
              scale: 1,
              rotation: 0
            });
            layer = (0, _timeline.addPropertyKeyframe)(layer, 0, 'x', -100, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 2000, 'x', 300, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 0, 'y', 50, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 2000, 'y', -150, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 0, 'rotation', 0, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 2000, 'rotation', 180, 'linear');
            var state = (0, _animation.evaluateLayerAtTime)(layer, 1500);
            assert.strictEqual(state.active, true);
            assert.strictEqual(state.localTimeMs, 1000);
            assert.strictEqual(state.x, 100);
            assert.strictEqual(state.y, -50);
            assert.strictEqual(state.rotation, 90);
            return "At projectTime=1500ms (local=1000ms): x=".concat(state.x, ", y=").concat(state.y, ", rotation=").concat(state.rotation, "deg, active=").concat(state.active);
          });
        case 5:
          _context4.next = 7;
          return runTest('UT-02', 'حساب الاستيفاء بين إطارين مفتاحيين (Linear, Ease, CubicBezier, Step)', function () {
            var kfLinear = [{
              id: '1',
              timeMs: 0,
              value: 0,
              easing: 'linear'
            }, {
              id: '2',
              timeMs: 1000,
              value: 100,
              easing: 'linear'
            }];
            var kfEaseIn = [{
              id: '1',
              timeMs: 0,
              value: 0,
              easing: 'easeIn'
            }, {
              id: '2',
              timeMs: 1000,
              value: 100,
              easing: 'linear'
            }];
            var kfEaseOut = [{
              id: '1',
              timeMs: 0,
              value: 0,
              easing: 'easeOut'
            }, {
              id: '2',
              timeMs: 1000,
              value: 100,
              easing: 'linear'
            }];
            var kfBezier = [{
              id: '1',
              timeMs: 0,
              value: 0,
              easing: 'cubicBezier',
              controlPoints: [0.25, 0.1, 0.25, 1.0]
            }, {
              id: '2',
              timeMs: 1000,
              value: 100,
              easing: 'linear'
            }];
            var kfStep = [{
              id: '1',
              timeMs: 0,
              value: 10,
              easing: 'step'
            }, {
              id: '2',
              timeMs: 1000,
              value: 90,
              easing: 'linear'
            }];
            var vLin = (0, _animation.interpolateKeyframes)(kfLinear, 500, 0);
            var vIn = (0, _animation.interpolateKeyframes)(kfEaseIn, 500, 0);
            var vOut = (0, _animation.interpolateKeyframes)(kfEaseOut, 500, 0);
            var vBez = (0, _animation.interpolateKeyframes)(kfBezier, 500, 0);
            var vStepMid = (0, _animation.interpolateKeyframes)(kfStep, 999, 0);
            var vStepEnd = (0, _animation.interpolateKeyframes)(kfStep, 1000, 0);
            assert.strictEqual(vLin, 50);
            assert.strictEqual(vIn, 25);
            assert.strictEqual(vOut, 75);
            assert.ok(vBez > 60 && vBez < 90);
            assert.strictEqual(vStepMid, 10);
            assert.strictEqual(vStepEnd, 90);
            return "t=500ms -> linear=".concat(vLin, ", easeIn=").concat(vIn, ", easeOut=").concat(vOut, ", cubicBezier=").concat(vBez.toFixed(2), ", step(999ms)=").concat(vStepMid, ", step(1000ms)=").concat(vStepEnd);
          });
        case 7:
          _context4.next = 9;
          return runTest('UT-03', 'التعامل مع القيم الزمنية خارج المدة (Out-of-bounds time handling)', function () {
            var layer = (0, _project.makeLayer)('text', 1, {
              startMs: 1000,
              durationMs: 2000,
              opacity: 1
            });
            layer = (0, _timeline.addPropertyKeyframe)(layer, 500, 'x', -50, 'linear');
            layer = (0, _timeline.addPropertyKeyframe)(layer, 1500, 'x', 150, 'linear');
            var beforeLayer = (0, _animation.evaluateLayerAtTime)(layer, 500);
            var beforeFirstKf = (0, _animation.evaluateLayerAtTime)(layer, 1200);
            var afterLastKf = (0, _animation.evaluateLayerAtTime)(layer, 2800);
            var afterLayer = (0, _animation.evaluateLayerAtTime)(layer, 3500);
            assert.strictEqual(beforeLayer.active, false);
            assert.strictEqual(beforeLayer.opacity, 0);
            assert.strictEqual(beforeFirstKf.active, true);
            assert.strictEqual(beforeFirstKf.x, -50);
            assert.strictEqual(afterLastKf.active, true);
            assert.strictEqual(afterLastKf.x, 150);
            assert.strictEqual(afterLayer.active, false);
            assert.strictEqual(afterLayer.opacity, 0);
            var p = (0, _project.makeProject)({
              durationMs: 4000
            });
            assert.strictEqual((0, _timeline.movePlayhead)(p, -500).currentTimeMs, 0);
            assert.strictEqual((0, _timeline.movePlayhead)(p, 99999).currentTimeMs, 4000);
            return "Inactive @500ms (opacity=".concat(beforeLayer.opacity, "), clamped pre-keyframe @1200ms (x=").concat(beforeFirstKf.x, "), clamped post-keyframe @2800ms (x=").concat(afterLastKf.x, "), inactive @3500ms (opacity=").concat(afterLayer.opacity, ")");
          });
        case 9:
          _context4.next = 11;
          return runTest('UT-04', 'ترتيب الطبقات والقص والتقسيم والتقدم الإطاري (Layer ordering, trimming, splitting & frame step)', function () {
            var proj = (0, _project.makeProject)({
              fps: 25,
              layers: []
            });
            proj = (0, _timeline.addLayer)(proj, 'text', {
              name: 'Top Text'
            });
            proj = (0, _timeline.addLayer)(proj, 'shape', {
              name: 'Mid Shape'
            });
            proj = (0, _timeline.addLayer)(proj, 'image', {
              name: 'Back Image'
            });
            var scene1 = (0, _preview.evaluateSceneAtTime)(proj, 0);
            assert.deepStrictEqual(scene1.visualNodes.map(function (n) {
              return n.name;
            }), ['Back Image', 'Mid Shape', 'Top Text']);
            var backId = proj.layers[2].id;
            proj = (0, _timeline.moveLayerOrder)(proj, backId, 'front');
            assert.strictEqual(proj.layers[0].name, 'Back Image');
            proj = (0, _timeline.splitLayerAtTime)(proj, backId, 2000);
            assert.strictEqual(proj.layers.length, 4);
            assert.strictEqual(proj.layers[0].durationMs, 2000);
            assert.strictEqual(proj.layers[1].startMs, 2000);
            assert.strictEqual(proj.layers[1].durationMs, 3000);
            var ctrl = new _preview.PlaybackController();
            var stepped = ctrl.step(proj, 3); // 3 frames @ 25fps = 120ms
            assert.strictEqual(stepped.currentTimeMs, 120);
            return "Painter order verified; moved layer to front; split 5000ms layer into 2000ms + 3000ms; frame step +3f @25fps -> ".concat(stepped.currentTimeMs, "ms");
          });
        case 11:
          _context4.next = 13;
          return runTest('UT-05', 'الحفظ الذري وإعادة التحميل وترقية المخطط (Atomic save, backup recovery & v1->v2 migration)', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            var adapter, storage, legacyV1, migrated, updated, saveRes, reopened, recovered;
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  adapter = new _projectStorage.InMemoryStorageAdapter();
                  storage = new _projectStorage.ProjectStorageManager(adapter);
                  legacyV1 = {
                    schemaVersion: 1,
                    id: 'legacy-proj-1',
                    name: 'Legacy v1 Project',
                    width: 1080,
                    height: 1920,
                    fps: 30,
                    durationMs: 4000,
                    currentTimeMs: 1200,
                    layers: [{
                      id: 'l1',
                      name: 'Title',
                      kind: 'text',
                      visible: true,
                      locked: false,
                      startMs: 0,
                      durationMs: 4000,
                      opacity: 0.9,
                      x: 15,
                      y: -25,
                      scale: 1.2,
                      keyframes: [{
                        id: 'opacity-500',
                        timeMs: 500,
                        value: 0.5,
                        easing: 'easeInOut'
                      }],
                      effects: []
                    }]
                  };
                  migrated = (0, _project.migrateProject)(legacyV1);
                  assert.strictEqual(migrated.schemaVersion, 2);
                  assert.strictEqual(migrated.layers[0].keyframes[0].property, 'opacity');
                  _context2.next = 8;
                  return storage.saveProject(migrated);
                case 8:
                  updated = _objectSpread(_objectSpread({}, migrated), {}, {
                    name: 'Updated v2 Project'
                  });
                  _context2.next = 11;
                  return storage.saveProject(updated);
                case 11:
                  saveRes = _context2.sent;
                  assert.strictEqual(saveRes.backedUpPrevious, true);
                  _context2.next = 15;
                  return storage.loadLastOpenedProject();
                case 15:
                  reopened = _context2.sent;
                  assert.ok(reopened);
                  assert.strictEqual(reopened.project.name, 'Updated v2 Project');
                  _context2.next = 20;
                  return adapter.setItem("project:".concat(migrated.id), '{corrupted_json_syntax');
                case 20:
                  _context2.next = 22;
                  return storage.loadProject(migrated.id);
                case 22:
                  recovered = _context2.sent;
                  assert.strictEqual(recovered.recoveredFromBackup, true);
                  assert.strictEqual(recovered.project.name, 'Legacy v1 Project');
                  return _context2.abrupt("return", "v1->v2 migrated losslessly; atomic save & reopen succeeded; corrupted primary recovered automatically from .bak (".concat(recovered.project.name, ")"));
                case 26:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })));
        case 13:
          _context4.next = 15;
          return runTest('UT-06', 'رفض استيراد المشاريع غير الصالحة أو الخبيثة (Invalid project import rejection)', function () {
            var invalidCases = [{
              label: 'null payload',
              payload: null
            }, {
              label: 'unsupported schemaVersion 99',
              payload: {
                schemaVersion: 99,
                width: 1080,
                height: 1920,
                layers: []
              }
            }, {
              label: 'negative width',
              payload: {
                schemaVersion: 2,
                width: -100,
                height: 1920,
                layers: []
              }
            }, {
              label: 'NaN height',
              payload: {
                schemaVersion: 2,
                width: 1080,
                height: Number.NaN,
                layers: []
              }
            }, {
              label: 'invalid layer kind',
              payload: {
                schemaVersion: 2,
                width: 1080,
                height: 1920,
                layers: [{
                  id: '1',
                  name: 'Bad',
                  kind: 'malicious_exe',
                  startMs: 0,
                  durationMs: 1000
                }]
              }
            }, {
              label: 'exceeds 200 layers limit',
              payload: {
                schemaVersion: 2,
                width: 1080,
                height: 1920,
                layers: Array.from({
                  length: 205
                }, function (_, i) {
                  return (0, _project.makeLayer)('text', i);
                })
              }
            }];
            for (var _i = 0, _invalidCases = invalidCases; _i < _invalidCases.length; _i++) {
              var c = _invalidCases[_i];
              var threw = false;
              try {
                (0, _project.validateProject)(c.payload);
              } catch (_unused) {
                threw = true;
              }
              assert.strictEqual(threw, true, "Expected validateProject to reject ".concat(c.label));
            }
            return "Rejected all ".concat(invalidCases.length, " invalid/malformed project payloads cleanly with descriptive errors");
          });
        case 15:
          _context4.next = 17;
          return runTest('UT-07', 'استيراد صورة وفيديو وصوت والتحقق من البصمة الرقمية (Media import & magic-byte validation)', function () {
            var _vidAsset$durationMs, _vidAsset$durationMs2, _audAsset$durationMs, _audAsset$durationMs2;
            var imgAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.imagePath);
            var vidAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.videoPath);
            var audAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.audioPath);
            assert.strictEqual(imgAsset.kind, 'image');
            assert.strictEqual(imgAsset.width, 120);
            assert.strictEqual(imgAsset.height, 80);
            assert.strictEqual(vidAsset.kind, 'video');
            assert.strictEqual(vidAsset.width, 320);
            assert.strictEqual(vidAsset.height, 240);
            assert.ok(((_vidAsset$durationMs = vidAsset.durationMs) !== null && _vidAsset$durationMs !== void 0 ? _vidAsset$durationMs : 0) >= 2400 && ((_vidAsset$durationMs2 = vidAsset.durationMs) !== null && _vidAsset$durationMs2 !== void 0 ? _vidAsset$durationMs2 : 0) <= 2600);
            assert.strictEqual(audAsset.kind, 'audio');
            assert.ok(((_audAsset$durationMs = audAsset.durationMs) !== null && _audAsset$durationMs !== void 0 ? _audAsset$durationMs : 0) >= 2900 && ((_audAsset$durationMs2 = audAsset.durationMs) !== null && _audAsset$durationMs2 !== void 0 ? _audAsset$durationMs2 : 0) <= 3100);
            assert["throws"](function () {
              return (0, _exporter.importMediaFileFromDisk)(fixtures.corruptPath);
            }, /Unsupported or corrupted/);
            assert["throws"](function () {
              return (0, _exporter.importMediaFileFromDisk)('../secret/passwd');
            }, /Path traversal/);
            return "Imported PNG (".concat(imgAsset.width, "x").concat(imgAsset.height, "), MP4 (").concat(vidAsset.width, "x").concat(vidAsset.height, ", ").concat(vidAsset.durationMs, "ms), WAV (").concat(audAsset.durationMs, "ms); rejected corrupt & traversal paths");
          });
        case 17:
          _context4.next = 19;
          return runTest('UT-08', 'مزامنة مدة الصوت والفيديو ونقاط القص (Audio/video duration & trim synchronization)', function () {
            var vidAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.videoPath);
            var audAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.audioPath);
            var proj = (0, _project.makeProject)({
              durationMs: 3000,
              layers: []
            });
            proj = (0, _timeline.addMediaLayer)(proj, vidAsset);
            proj = (0, _timeline.addMediaLayer)(proj, audAsset);
            var audioLayerId = proj.layers[1].id;
            proj.layers[1] = (0, _timeline.trimLayer)(proj.layers[1], 500, 3000, 200, 4000);
            proj.durationMs = 3000;
            proj.layers[1] = (0, _timeline.addPropertyKeyframe)(proj.layers[1], 0, 'volume', 1.0, 'linear');
            proj.layers[1] = (0, _timeline.addPropertyKeyframe)(proj.layers[1], 2500, 'volume', 0.5, 'linear');
            var mixPlan = (0, _mediaPipeline.computeAudioMixPlan)(proj);
            assert.strictEqual(mixPlan.tracks.length, 2);
            var aTrack = mixPlan.tracks.find(function (t) {
              return t.layerId === audioLayerId;
            });
            assert.strictEqual(aTrack.startMs, 500);
            assert.strictEqual(aTrack.durationMs, 2500);
            assert.strictEqual(aTrack.inPointMs, 200);
            assert.strictEqual(aTrack.outPointMs, 2700);
            assert.ok(aTrack.gain > 0.6 && aTrack.gain < 0.9);
            return "Synced ".concat(mixPlan.tracks.length, " audio tracks; audio track clamped to [start=").concat(aTrack.startMs, "ms, dur=").concat(aTrack.durationMs, "ms, in=").concat(aTrack.inPointMs, "ms, out=").concat(aTrack.outPointMs, "ms, avgGain=").concat(aTrack.gain, "]");
          });
        case 19:
          exportedMp4Path = path.resolve('/working_dir/c_266ae59874133d1d/artifacts/file_generation/ttl=63d/output/integration_test_output.mp4'); // UT-09: Exporting Reference Project to MP4 + Cancellation Verification
          _context4.next = 22;
          return runTest('UT-09', 'التصدير الفعلي إلى MP4 والتحقق من التقدم والإلغاء (Real MP4 Export & Cancellation)', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
            var imgAsset, audAsset, textLayer, movingShape, imageLayer, audioLayer, project, abortCtrl, cancelledCleanly, progressEvents, metadata;
            return _regeneratorRuntime().wrap(function _callee3$(_context3) {
              while (1) switch (_context3.prev = _context3.next) {
                case 0:
                  imgAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.imagePath);
                  audAsset = (0, _exporter.importMediaFileFromDisk)(fixtures.audioPath);
                  textLayer = (0, _project.makeLayer)('text', 1, {
                    name: 'Timed Banner Text',
                    text: 'MOTION STUDIO',
                    fontSize: 42,
                    color: '#FFFFFF',
                    startMs: 1000,
                    durationMs: 1500,
                    x: 0,
                    y: -10,
                    opacity: 1
                  });
                  movingShape = (0, _project.makeLayer)('shape', 2, {
                    name: 'Moving Crimson Box',
                    shape: 'rectangle',
                    color: '#FF3366',
                    width: 112,
                    height: 88,
                    startMs: 0,
                    durationMs: 3000,
                    x: -180,
                    y: 120,
                    rotation: 0,
                    opacity: 1
                  });
                  movingShape = (0, _timeline.addPropertyKeyframe)(movingShape, 0, 'x', -180, 'linear');
                  movingShape = (0, _timeline.addPropertyKeyframe)(movingShape, 3000, 'x', 180, 'linear');
                  imageLayer = (0, _project.makeLayer)('image', 3, {
                    name: 'Static Emerald Image',
                    mediaId: imgAsset.id,
                    sourceUri: imgAsset.uri,
                    width: 180,
                    height: 108,
                    startMs: 0,
                    durationMs: 3000,
                    x: -160,
                    y: -130,
                    opacity: 1
                  });
                  audioLayer = (0, _project.makeLayer)('audio', 4, {
                    name: 'Synced Sine Audio',
                    mediaId: audAsset.id,
                    sourceUri: audAsset.uri,
                    startMs: 0,
                    durationMs: 3000,
                    volume: 0.9
                  });
                  project = _objectSpread(_objectSpread({}, (0, _project.makeProject)({
                    name: 'Integration Reference Scene',
                    width: 640,
                    height: 480,
                    fps: 20,
                    durationMs: 3000,
                    backgroundColor: '#121629',
                    layers: []
                  })), {}, {
                    mediaAssets: [imgAsset, audAsset],
                    layers: [textLayer, movingShape, imageLayer, audioLayer]
                  }); // First verify pre-aborted signal cancels cleanly
                  abortCtrl = new AbortController();
                  abortCtrl.abort();
                  cancelledCleanly = false;
                  _context3.prev = 12;
                  _context3.next = 15;
                  return (0, _exporter.exportProjectToMp4)(project, {
                    outputPath: path.join(fixtureDir, 'cancelled.mp4'),
                    signal: abortCtrl.signal
                  });
                case 15:
                  _context3.next = 20;
                  break;
                case 17:
                  _context3.prev = 17;
                  _context3.t0 = _context3["catch"](12);
                  cancelledCleanly = true;
                case 20:
                  assert.strictEqual(cancelledCleanly, true);

                  // Now run full MP4 export
                  progressEvents = [];
                  _context3.next = 24;
                  return (0, _exporter.exportProjectToMp4)(project, {
                    outputPath: exportedMp4Path,
                    onProgress: function onProgress(ev) {
                      return progressEvents.push(ev.percent);
                    }
                  });
                case 24:
                  metadata = _context3.sent;
                  assert.strictEqual(metadata.valid, true);
                  assert.strictEqual(metadata.videoCodec, 'h264');
                  assert.strictEqual(metadata.audioCodec, 'aac');
                  assert.strictEqual(metadata.width, 640);
                  assert.strictEqual(metadata.height, 480);
                  assert.strictEqual(metadata.fps, 20);
                  assert.strictEqual(metadata.nbFrames, 60);
                  assert.strictEqual(metadata.hasAudioStream, true);
                  assert.ok(progressEvents.includes(100));
                  return _context3.abrupt("return", "Exported MP4 to ".concat(path.basename(exportedMp4Path), " (").concat(metadata.sizeBytes, " bytes, ").concat(metadata.width, "x").concat(metadata.height, "@").concat(metadata.fps, "fps, ").concat(metadata.nbFrames, " frames, ").concat(metadata.durationSec, "s, codecs=").concat(metadata.videoCodec, "/").concat(metadata.audioCodec, "); cancellation verified."));
                case 35:
                case "end":
                  return _context3.stop();
              }
            }, _callee3, null, [[12, 17]]);
          })));
        case 22:
          _context4.next = 24;
          return runTest('UT-10', 'إعادة فتح الفيديو الناتج والتحقق من الحركة والنص والصورة والصوت (Reopen & Verify Exported MP4 Frames & Audio)', function () {
            var verified = (0, _exporter.verifyExportedMp4)(exportedMp4Path);
            assert.strictEqual(verified.valid, true);
            assert.strictEqual(verified.hasAudioStream, true);

            // Decode frames at t=0.4s (before text appears, shape on left), t=1.5s (text visible, shape at center), t=2.6s (after text disappears, shape on right)
            var frameEarly = (0, _exporter.decodeMediaFrameToRgba)(exportedMp4Path, 640, 480, 400);
            var frameMid = (0, _exporter.decodeMediaFrameToRgba)(exportedMp4Path, 640, 480, 1500);
            var frameLate = (0, _exporter.decodeMediaFrameToRgba)(exportedMp4Path, 640, 480, 2600);
            assert.ok(frameEarly && frameMid && frameLate, 'Failed to decode frames from exported MP4');
            var getPixel = function getPixel(img, x, y) {
              var i = (y * img.width + x) * 4;
              return [img.data[i], img.data[i + 1], img.data[i + 2]];
            };

            // 1. Static image at (320-160=160, 240-130=110): bright green (G > 150) across all timestamps
            var imgEarly = getPixel(frameEarly, 160, 110);
            var imgMid = getPixel(frameMid, 160, 110);
            var imgLate = getPixel(frameLate, 160, 110);
            assert.ok(imgEarly[1] > 150 && imgMid[1] > 150 && imgLate[1] > 150);

            // 2. Moving shape along y = 240 + 120 = 360:
            // At t=0.4s: x = 320 + (-180 + 360*(0.4/3.0)) = 188 (crimson R > 160)
            // At t=1.5s: x = 320 (crimson R > 160, while x=188 is now background R < 50)
            // At t=2.6s: x = 320 + (-180 + 360*(2.6/3.0)) = 452 (crimson R > 160, while x=320 is now background R < 50)
            var shapeEarlyAt188 = getPixel(frameEarly, 188, 360);
            var shapeMidAt320 = getPixel(frameMid, 320, 360);
            var bgMidAt188 = getPixel(frameMid, 188, 360);
            var shapeLateAt452 = getPixel(frameLate, 452, 360);
            assert.ok(shapeEarlyAt188[0] > 160, "Shape expected at x=188 at t=0.4s, got ".concat(shapeEarlyAt188));
            assert.ok(shapeMidAt320[0] > 160, "Shape expected at x=320 at t=1.5s, got ".concat(shapeMidAt320));
            assert.ok(bgMidAt188[0] < 60, "Background expected at x=188 at t=1.5s, got ".concat(bgMidAt188));
            assert.ok(shapeLateAt452[0] > 160, "Shape expected at x=452 at t=2.6s, got ".concat(shapeLateAt452));

            // 3. Timed text region (y in 210..250, x in 180..460): count bright white pixels (R>180, G>180, B>180)
            var countBrightTextPixels = function countBrightTextPixels(img) {
              var count = 0;
              for (var y = 205; y <= 255; y++) {
                for (var x = 180; x <= 460; x++) {
                  var _getPixel = getPixel(img, x, y),
                    _getPixel2 = _slicedToArray(_getPixel, 3),
                    r = _getPixel2[0],
                    g = _getPixel2[1],
                    b = _getPixel2[2];
                  if (r > 180 && g > 180 && b > 180) count++;
                }
              }
              return count;
            };
            var brightEarly = countBrightTextPixels(frameEarly);
            var brightMid = countBrightTextPixels(frameMid);
            var brightLate = countBrightTextPixels(frameLate);
            assert.strictEqual(brightEarly, 0, "Expected 0 text pixels at t=0.4s, got ".concat(brightEarly));
            assert.ok(brightMid > 400, "Expected >400 text pixels at t=1.5s, got ".concat(brightMid));
            assert.strictEqual(brightLate, 0, "Expected 0 text pixels at t=2.6s, got ".concat(brightLate));
            return "Decoded MP4 frames verified: static image RGB=".concat(imgMid.join('/'), "; moving shape X tracked (188px @0.4s -> 320px @1.5s -> 452px @2.6s); timed text pixels (").concat(brightEarly, " @0.4s -> ").concat(brightMid, " @1.5s -> ").concat(brightLate, " @2.6s).");
          });
        case 24:
          tempMgr.cleanupAll();
          failed = results.filter(function (r) {
            return r.status === 'FAIL';
          });
          console.log('\n======================================================');
          console.log("SUMMARY: ".concat(results.length - failed.length, "/").concat(results.length, " TESTS PASSED"));
          console.log('======================================================');
          reportPath = path.resolve('/tmp/ms_work/test_results.json');
          fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            results: results
          }, null, 2));
          if (failed.length > 0) {
            process.exit(1);
          }
        case 32:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _main.apply(this, arguments);
}
main()["catch"](function (err) {
  console.error(err);
  process.exit(1);
});