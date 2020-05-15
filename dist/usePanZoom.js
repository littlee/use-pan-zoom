"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = require("react");

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

function tryCall(fn) {
  if (typeof fn === 'function') {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return fn.apply(void 0, args);
  }
}

function distance2p(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      p1 = _ref2[0],
      p2 = _ref2[1];

  return Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
}

function center2p(_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      p1 = _ref4[0],
      p2 = _ref4[1];

  return {
    x: (p1.clientX + p2.clientX) / 2,
    y: (p1.clientY + p2.clientY) / 2
  };
}

function getInsideTouch(rect, touches) {
  return [].filter.call(touches, function (item) {
    return item.clientX >= rect.x && item.clientX <= rect.x + rect.width && item.clientY >= rect.y && item.clientY <= rect.y + rect.height;
  });
}

function usePanZoom() {
  var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref5$minScale = _ref5.minScale,
      minScale = _ref5$minScale === void 0 ? -Infinity : _ref5$minScale,
      _ref5$maxScale = _ref5.maxScale,
      maxScale = _ref5$maxScale === void 0 ? Infinity : _ref5$maxScale,
      onPanStart = _ref5.onPanStart,
      onPan = _ref5.onPan,
      onPanEnd = _ref5.onPanEnd,
      onZoomStart = _ref5.onZoomStart,
      onZoom = _ref5.onZoom,
      onZoomEnd = _ref5.onZoomEnd,
      _ref5$bounds = _ref5.bounds,
      bounds = _ref5$bounds === void 0 ? {
    x: [-Infinity, Infinity],
    y: [-Infinity, Infinity]
  } : _ref5$bounds;

  var elemDomRef = (0, _react.useRef)();
  var elemRectRef = (0, _react.useRef)({
    width: 0,
    height: 0
  });
  var elemRef = (0, _react.useCallback)(function (node) {
    if (node !== null) {
      var rect = node.getBoundingClientRect();
      elemRectRef.current = rect;
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
      rect: elemRectRef.current
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
        x: (rOrigin.x - ms.x) / nextScale,
        y: (rOrigin.y - ms.y) / nextScale
      };
      var elemSize = elemRectRef.current;
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
          tryCall(cbRef.current.onZoomStart, e);
          called = true;
        } else {
          tryCall(cbRef.current.onZoom, e);
        }

        clearTimeout(t);
        t = setTimeout(function () {
          tryCall(cbRef.current.onZoomEnd, e);
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
    function dragMoveListener(event) {
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

    var $elem = elemDomRef.current;
    var prevTouch = {
      clientX: 0,
      clientY: 0
    };
    var prevZoomTouch = [{
      clientX: 0,
      clientY: 0
    }, {
      clientX: 0,
      clientY: 0
    }];

    function onTouchStart(e) {
      e.preventDefault();
      var touches = getInsideTouch(elemRectRef.current, e.touches); // pan

      if (touches.length === 1) {
        var _e$touches = _slicedToArray(e.touches, 1),
            touch = _e$touches[0];

        tryCall(cbRef.current.onPanStart, e);
        prevTouch.clientX = touch.clientX;
        prevTouch.clientY = touch.clientY;
      } // zoom
      else if (touches.length >= 2) {
          var touchCenter = center2p(touches);
          setOrigin(touchCenter);
          tryCall(cbRef.current.onZoomStart, e);
          prevZoomTouch = [{
            clientX: touches[0].clientX,
            clientY: touches[0].clientY
          }, {
            clientX: touches[1].clientX,
            clientY: touches[1].clientY
          }];
        }
    }

    function onTouchMove(e) {
      e.preventDefault();
      var touches = getInsideTouch(elemRectRef.current, e.touches); // pan

      if (touches.length === 1) {
        var _touches = _slicedToArray(touches, 1),
            touch = _touches[0];

        var deltaX = touch.clientX - prevTouch.clientX;
        var deltaY = touch.clientY - prevTouch.clientY;
        dragMoveListener({
          dx: deltaX,
          dy: deltaY
        });
        tryCall(cbRef.current.onPan, e);
        prevTouch.clientX = touch.clientX;
        prevTouch.clientY = touch.clientY;
      } // zoom
      else if (touches.length >= 2) {
          var touchCenter = center2p(touches);
          var dis = distance2p(touches);
          var prevDis = distance2p(prevZoomTouch);
          var deltaDis = dis - prevDis;
          setOrigin(touchCenter);
          zoom(deltaDis * 0.005);
          tryCall(cbRef.current.onZoom, e);
          prevZoomTouch = [{
            clientX: touches[0].clientX,
            clientY: touches[0].clientY
          }, {
            clientX: touches[1].clientX,
            clientY: touches[1].clientY
          }];
        }
    }

    function onTouchEnd(e) {
      e.preventDefault();
      var touches = getInsideTouch(elemRectRef.current, e.changedTouches); // pan

      if (touches.length === 1) {
        tryCall(cbRef.current.onPanEnd, e);
      } // zoom
      else if (touches.length >= 2) {
          tryCall(cbRef.current.onZoomEnd, e);
        }
    }

    $elem.addEventListener('touchstart', onTouchStart);
    $elem.addEventListener('touchmove', onTouchMove);
    $elem.addEventListener('touchend', onTouchEnd);
    return function () {
      $elem.removeEventListener('touchstart', onTouchStart);
      $elem.removeEventListener('touchmove', onTouchMove);
      $elem.removeEventListener('touchend', onTouchEnd);
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