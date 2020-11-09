"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = require("react");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var IS_TOUCH_DEVICE = document.ontouchstart !== undefined;

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
    clientX: (p1.clientX + p2.clientX) / 2,
    clientY: (p1.clientY + p2.clientY) / 2
  };
}

function clamp(min, max, value) {
  if (min > max) {
    throw new Error('min must not be greater than max in clamp(min, max, value)');
  }

  return value < min ? min : value > max ? max : value;
}

function isNil(x) {
  return x == null;
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

function getTouches(e) {
  if (IS_TOUCH_DEVICE) {
    return e.touches;
  }

  return [{
    clientX: e.clientX,
    clientY: e.clientY
  }];
}

function getScaleMultiplier(delta) {
  var sign = Math.sign(delta);
  var deltaAdjustedSpeed = Math.min(0.25, Math.abs(delta / 128));
  return 1 - sign * deltaAdjustedSpeed;
}

function getErr(msg) {
  return "usePanZoom: ".concat(msg);
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

  if (!isNil(minScale) && typeof minScale !== 'number') {
    throw Error(getErr('minScale should be number'));
  }

  if (!isNil(maxScale) && typeof maxScale !== 'number') {
    throw Error(getErr('maxScale should be number'));
  }

  if (!isNil(bounds) && ['object', 'function'].indexOf(_typeof(bounds)) === -1) {
    throw Error(getErr('bounds should be object ({x?:[Number, Number], y?:[Number, Number]}) or function'));
  }

  if (_typeof(bounds) === 'object') {
    if (!bounds.x) {
      bounds.x = [-Infinity, Infinity];
    }

    if (!bounds.y) {
      bounds.y = [-Infinity, Infinity];
    }
  }

  var domRef = (0, _react.useRef)();

  var _useState = (0, _react.useState)({
    x: 0,
    y: 0,
    scale: 1
  }),
      _useState2 = _slicedToArray(_useState, 2),
      style = _useState2[0],
      setStyle = _useState2[1];

  var elemRef = (0, _react.useCallback)(function (node) {
    if (node) {
      domRef.current = node;
    }
  }, []);
  var boundsRef = (0, _react.useRef)();
  var cbRef = (0, _react.useRef)();
  (0, _react.useEffect)(function () {
    boundsRef.current = sortBounds(getFnValue(bounds, {}));
    cbRef.current = {
      onPanStart: onPanStart,
      onPan: onPan,
      onPanEnd: onPanEnd,
      onZoomStart: onZoomStart,
      onZoom: onZoom,
      onZoomEnd: onZoomEnd
    };
  });
  (0, _react.useEffect)(function () {
    var isTouching = false;
    var $dom = domRef.current;
    var $parent = $dom.parentElement;
    var initRect = $dom.getBoundingClientRect();
    var parentInitRect = $parent.getBoundingClientRect();

    function zoom(point, delta) {
      var clientX = point.clientX,
          clientY = point.clientY;
      var amount = getScaleMultiplier(delta);
      var parentNowRect = $parent.getBoundingClientRect();
      var parentDiff = {
        top: parentNowRect.top - parentInitRect.top,
        left: parentNowRect.left - parentInitRect.left
      };
      setStyle(function (prevStyle) {
        var xs = (clientX - initRect.left - parentDiff.left - prevStyle.x) / prevStyle.scale;
        var ys = (clientY - initRect.top - parentDiff.top - prevStyle.y) / prevStyle.scale;
        var nextScale = clamp(minScale, maxScale, prevStyle.scale * amount);

        var _boundsRef$current$x = _slicedToArray(boundsRef.current.x, 2),
            minX = _boundsRef$current$x[0],
            maxX = _boundsRef$current$x[1];

        var _boundsRef$current$y = _slicedToArray(boundsRef.current.y, 2),
            minY = _boundsRef$current$y[0],
            maxY = _boundsRef$current$y[1];

        return {
          scale: nextScale,
          x: clamp(minX, maxX, clientX - initRect.left - parentDiff.left - xs * nextScale),
          y: clamp(minY, maxY, clientY - initRect.top - parentDiff.top - ys * nextScale)
        };
      });
    }

    var wheelTimer = null;
    var wheelCalled = false;

    function onWheel(e) {
      e.preventDefault();
      var clientX = e.clientX,
          clientY = e.clientY,
          deltaY = e.deltaY;
      zoom({
        clientX: clientX,
        clientY: clientY
      }, deltaY);

      if (!wheelCalled) {
        getFnValue(cbRef.current.onZoomStart, e);
        wheelCalled = true;
      } else {
        getFnValue(cbRef.current.onZoom, e);
      }

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () {
        getFnValue(cbRef.current.onZoomEnd, e);
        wheelCalled = false;
      }, 200);
    }

    var prevTouches = [];

    function onTouchStart(e) {
      isTouching = true;
      var touches = getTouches(e);
      prevTouches = [].map.call(touches, function (t) {
        return {
          clientX: t.clientX,
          clientY: t.clientY
        };
      });

      if (touches.length === 1) {
        getFnValue(cbRef.current.onPanStart, e);
      } else if (touches.length === 2) {
        getFnValue(cbRef.current.onZoomStart, e);
      }
    }

    function onTouchMove(e) {
      e.preventDefault();

      if (!isTouching) {
        return;
      }

      var touches = getTouches(e);

      if (touches.length === 1) {
        var _touches = _slicedToArray(touches, 1),
            touch = _touches[0];

        var delta = {
          x: touch.clientX - prevTouches[0].clientX,
          y: touch.clientY - prevTouches[0].clientY
        };

        var _boundsRef$current$x2 = _slicedToArray(boundsRef.current.x, 2),
            minX = _boundsRef$current$x2[0],
            maxX = _boundsRef$current$x2[1];

        var _boundsRef$current$y2 = _slicedToArray(boundsRef.current.y, 2),
            minY = _boundsRef$current$y2[0],
            maxY = _boundsRef$current$y2[1];

        setStyle(function (prevStyle) {
          return _objectSpread(_objectSpread({}, prevStyle), {}, {
            x: clamp(minX, maxX, prevStyle.x + delta.x),
            y: clamp(minY, maxY, prevStyle.y + delta.y)
          });
        });
        getFnValue(cbRef.current.onPan, e);
      } else if (touches.length === 2) {
        var prevPoints = prevTouches.slice(0, 2);

        if (prevPoints.length < 2) {
          getFnValue(cbRef.current.onZoomStart, e);
        } else {
          var points = [{
            clientX: touches[0].clientX,
            clientY: touches[0].clientY
          }, {
            clientX: touches[1].clientX,
            clientY: touches[1].clientY
          }];
          var prevTouchDis = distance2p(prevPoints);
          var touchDis = distance2p(points);
          var touchCenter = center2p(points);
          zoom(touchCenter, prevTouchDis - touchDis);
          getFnValue(cbRef.current.onZoom, e);
        }
      }

      prevTouches = [].map.call(touches, function (t) {
        return {
          clientX: t.clientX,
          clientY: t.clientY
        };
      });
    }

    function onTouchEnd(e) {
      if (IS_TOUCH_DEVICE) {
        isTouching = Boolean(e.touches.length);
      } else {
        isTouching = false;
      } // hard to release all fingers at the same time ?


      if (prevTouches.length === 1) {
        getFnValue(cbRef.current.onPanEnd, e);
      } else if (prevTouches.length === 2) {
        getFnValue(cbRef.current.onZoomEnd, e);
      }

      var touches = getTouches(e);
      prevTouches = [].map.call(touches, function (t) {
        return {
          clientX: t.clientX,
          clientY: t.clientY
        };
      });
    }

    function onCtxMenu(e) {
      e.preventDefault();
    }

    $dom.addEventListener('wheel', onWheel);
    $dom.addEventListener('contextmenu', onCtxMenu);

    if (IS_TOUCH_DEVICE) {
      $dom.addEventListener('touchstart', onTouchStart);
      $dom.addEventListener('touchmove', onTouchMove);
      $dom.addEventListener('touchend', onTouchEnd);
    } else {
      $dom.addEventListener('mousedown', onTouchStart);
      window.addEventListener('mousemove', onTouchMove);
      window.addEventListener('mouseup', onTouchEnd);
    }

    return function () {
      $dom.removeEventListener('wheel', onWheel);
      $dom.removeEventListener('contextmenu', onCtxMenu);

      if (IS_TOUCH_DEVICE) {
        $dom.removeEventListener('touchstart', onTouchStart);
        $dom.removeEventListener('touchmove', onTouchMove);
        $dom.removeEventListener('touchend', onTouchEnd);
      } else {
        $dom.removeEventListener('mousedown', onTouchStart);
        window.removeEventListener('mousemove', onTouchMove);
        window.removeEventListener('mouseup', onTouchEnd);
      }
    };
  }, [minScale, maxScale]);

  function setStyleWithClamp(updater) {
    return setStyle(function (prevStyle) {
      var upVal = getFnValue(updater, prevStyle);

      if (typeof upVal.x === 'number') {
        var _bounds$x = _slicedToArray(bounds.x, 2),
            minX = _bounds$x[0],
            maxX = _bounds$x[1];

        upVal.x = clamp(minX, maxX, upVal.x);
      }

      if (typeof upVal.y === 'number') {
        var _bounds$y = _slicedToArray(bounds.y, 2),
            minY = _bounds$y[0],
            maxY = _bounds$y[1];

        upVal.y = clamp(minY, maxY, upVal.y);
      }

      if (typeof upVal.scale === 'number') {
        upVal.scale = clamp(minScale, maxScale, upVal.scale);
      }

      return _objectSpread(_objectSpread({}, prevStyle), upVal);
    });
  }

  return {
    elemRef: elemRef,
    style: style,
    setStyle: setStyleWithClamp
  };
}

var _default = usePanZoom;
exports["default"] = _default;