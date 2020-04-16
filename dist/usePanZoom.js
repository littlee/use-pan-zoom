"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = require("react");

var _interactjs = _interopRequireDefault(require("interactjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function clamp(min, max, value) {
  if (min > max) {
    throw new Error('min must not be greater than max in clamp(min, max, value)');
  }

  return value < min ? min : value > max ? max : value;
}

function getFnValue(fn) {
  if (typeof fn === 'function') {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return fn.apply(void 0, args);
  }

  return fn;
}

function sortBounds(b) {
  return {
    x: b.x.sort(function (a, b) {
      return a - b;
    }),
    y: b.y.sort(function (a, b) {
      return a - b;
    })
  };
}

function usePanZoom() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$minScale = _ref.minScale,
      minScale = _ref$minScale === void 0 ? -Infinity : _ref$minScale,
      _ref$maxScale = _ref.maxScale,
      maxScale = _ref$maxScale === void 0 ? Infinity : _ref$maxScale,
      onPanStart = _ref.onPanStart,
      onPan = _ref.onPan,
      onPanEnd = _ref.onPanEnd,
      onZoomStart = _ref.onZoomStart,
      onZoom = _ref.onZoom,
      onZoomEnd = _ref.onZoomEnd,
      _ref$bounds = _ref.bounds,
      bounds = _ref$bounds === void 0 ? {
    x: [-Infinity, Infinity],
    y: [-Infinity, Infinity]
  } : _ref$bounds;

  var elemDomRef = (0, _react.useRef)();
  var sizeRef = (0, _react.useRef)({
    width: 0,
    height: 0
  });
  var elemRef = (0, _react.useCallback)(function (node) {
    if (node !== null) {
      var rect = node.getBoundingClientRect();
      sizeRef.current = {
        width: rect.width,
        height: rect.height
      };
      elemDomRef.current = node;
    }
  }, []);

  var _useState = (0, _react.useState)({
    x: 0,
    y: 0
  }),
      _useState2 = _slicedToArray(_useState, 2),
      origin = _useState2[0],
      setOrigin = _useState2[1];

  var _useState3 = (0, _react.useState)({
    x: 0,
    y: 0,
    scale: 1
  }),
      _useState4 = _slicedToArray(_useState3, 2),
      style = _useState4[0],
      setStyle = _useState4[1]; // ref copy


  var originRef = (0, _react.useRef)();
  var boundsRef = (0, _react.useRef)();
  var cbRef = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    originRef.current = origin;
    boundsRef.current = sortBounds(getFnValue(bounds, {
      elem: elemDomRef.current,
      origin: origin,
      style: style,
      size: sizeRef.current
    }));
    cbRef.current = {
      onPanStart: onPanStart,
      onPan: onPan,
      onPanEnd: onPanEnd,
      onZoomStart: onZoomStart,
      onZoom: onZoom,
      onZoomEnd: onZoomEnd
    };
  });
  var zoom = (0, _react.useCallback)(function (ds) {
    var rOrigin = originRef.current;
    var rBounds = boundsRef.current;
    setStyle(function (ms) {
      var nextScale = clamp(minScale, maxScale, ms.scale + ds);
      var clampDs = nextScale - ms.scale;
      var dot = {
        x: (rOrigin.x - ms.x) / ms.scale,
        y: (rOrigin.y - ms.y) / ms.scale
      };
      var elemSize = sizeRef.current;
      var accX = elemSize.width * clampDs * (dot.x / elemSize.width);
      var accY = elemSize.height * clampDs * (dot.y / elemSize.height);
      var nextX = clamp(rBounds.x[0], rBounds.x[1], ms.x - accX);
      var nextY = clamp(rBounds.y[0], rBounds.y[1], ms.y - accY);
      return _objectSpread({}, ms, {
        scale: nextScale,
        x: nextX,
        y: nextY
      });
    });
  }, [maxScale, minScale]);
  (0, _react.useEffect)(function () {
    var $elem = elemDomRef.current;
    var t = null;
    var called = false;

    function onWheel(e) {
      e.preventDefault();

      if (e.ctrlKey) {
        if (!called) {
          cbRef.current.onZoomStart && cbRef.current.onZoomStart(e);
          called = true;
        }

        clearTimeout(t);
        t = setTimeout(function () {
          cbRef.current.onZoomEnd && cbRef.current.onZoomEnd(e);
          called = false;
        }, 200);
        var ds = -1 * e.deltaY * 0.005;
        setOrigin({
          x: e.clientX,
          y: e.clientY
        });
        zoom(ds);
      }
    }

    $elem.addEventListener('wheel', onWheel);
    return function () {
      clearTimeout(t);
      $elem.removeEventListener('wheel', onWheel);
    };
  }, [zoom]);
  (0, _react.useEffect)(function () {
    function dragMoveListener(event, ds) {
      setStyle(function (ms) {
        var rBounds = boundsRef.current;
        var nextX = clamp(rBounds.x[0], rBounds.x[1], ms.x + event.dx);
        var nextY = clamp(rBounds.y[0], rBounds.y[1], ms.y + event.dy);
        return _objectSpread({}, ms, {
          x: nextX,
          y: nextY
        });
      });
    }

    var _int = (0, _interactjs["default"])(elemDomRef.current).draggable({
      listeners: {
        start: function start(event) {
          cbRef.current.onPanStart && cbRef.current.onPanStart(event);
        },
        move: function move(event) {
          dragMoveListener(event);
          cbRef.current.onPan && cbRef.current.onPan(event);
        },
        end: function end(event) {
          cbRef.current.onPanEnd && cbRef.current.onPanEnd(event);
        }
      }
    }).gesturable({
      listeners: {
        start: function start(event) {
          setOrigin(event.page);
          cbRef.current.onZoomStart && cbRef.current.onZoomStart(event);
        },
        move: function move(event) {
          setOrigin(event.page);
          zoom(event.ds);
          cbRef.current.onZoom && cbRef.current.onZoom(event);
        },
        end: function end(event) {
          setOrigin(event.page);
          cbRef.current.onZoomEnd && cbRef.current.onZoomEnd(event);
        }
      }
    });

    return function () {
      _int.unset();
    };
  }, [zoom]);
  return {
    elemRef: elemRef,
    origin: origin,
    setOrigin: setOrigin,
    style: style,
    setStyle: setStyle
  };
}

var _default = usePanZoom;
exports["default"] = _default;