import { useRef, useEffect, useCallback, useState } from 'react';
const IS_TOUCH_DEVICE = document.ontouchstart !== undefined;

function distance2p([p1, p2]) {
  return Math.sqrt(
    Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2)
  );
}

function center2p([p1, p2]) {
  return {
    clientX: (p1.clientX + p2.clientX) / 2,
    clientY: (p1.clientY + p2.clientY) / 2
  };
}

function clamp(min, max, value) {
  if (min > max) {
    throw new Error(
      'min must not be greater than max in clamp(min, max, value)'
    );
  }
  return value < min ? min : value > max ? max : value;
}

function isNil(x) {
  return x == null;
}

function getFnValue(fn, ...args) {
  if (typeof fn === 'function') {
    return fn(...args);
  }
  return fn;
}

function sortBounds(b) {
  return {
    x: b.x.sort((a, b) => a - b),
    y: b.y.sort((a, b) => a - b)
  };
}

function getTouches(e) {
  if (IS_TOUCH_DEVICE) {
    return e.touches;
  }
  return [
    {
      clientX: e.clientX,
      clientY: e.clientY
    }
  ];
}

function getScaleMultiplier(delta) {
  var sign = Math.sign(delta);
  var deltaAdjustedSpeed = Math.min(0.25, Math.abs(delta / 128));
  return 1 - sign * deltaAdjustedSpeed;
}

function getErr(msg) {
  return `usePanZoom: ${msg}`;
}

function usePanZoom({
  minScale = -Infinity,
  maxScale = Infinity,
  onPanStart,
  onPan,
  onPanEnd,
  onZoomStart,
  onZoom,
  onZoomEnd,
  bounds = {
    x: [-Infinity, Infinity],
    y: [-Infinity, Infinity]
  }
} = {}) {
  if (!isNil(minScale) && typeof minScale !== 'number') {
    throw Error(getErr('minScale should be number'));
  }
  if (!isNil(maxScale) && typeof maxScale !== 'number') {
    throw Error(getErr('maxScale should be number'));
  }
  if (!isNil(bounds) && ['object', 'function'].indexOf(typeof bounds) === -1) {
    throw Error(
      getErr(
        'bounds should be object ({x?:[Number, Number], y?:[Number, Number]}) or function'
      )
    );
  }

  if (typeof bounds === 'object') {
    if (!bounds.x) {
      bounds.x = [-Infinity, Infinity];
    }
    if (!bounds.y) {
      bounds.y = [-Infinity, Infinity];
    }
  }

  const domRef = useRef();
  const [style, setStyle] = useState({
    x: 0,
    y: 0,
    scale: 1
  });

  const elemRef = useCallback(node => {
    if (node) {
      domRef.current = node;
    }
  }, []);

  const boundsRef = useRef();
  const cbRef = useRef();
  useEffect(() => {
    boundsRef.current = bounds;
    cbRef.current = {
      onPanStart,
      onPan,
      onPanEnd,
      onZoomStart,
      onZoom,
      onZoomEnd
    };
  });

  useEffect(() => {
    let isTouching = false;
    const $dom = domRef.current;
    const $parent = $dom.offsetParent;
    const initRect = $dom.getBoundingClientRect();
    const parentInitRect = $parent && $parent.getBoundingClientRect();

    function zoom(point, delta) {
      const { clientX, clientY } = point;
      const amount = getScaleMultiplier(delta);
      const parentNowRect = $parent && $parent.getBoundingClientRect();
      const parentDiff = $parent
        ? {
            top: parentNowRect.top - parentInitRect.top,
            left: parentNowRect.left - parentInitRect.left
          }
        : { top: 0, left: 0 };
      setStyle(prevStyle => {
        const xs =
          (clientX - initRect.left - parentDiff.left - prevStyle.x) /
          prevStyle.scale;
        const ys =
          (clientY - initRect.top - parentDiff.top - prevStyle.y) /
          prevStyle.scale;
        const nextScale = clamp(minScale, maxScale, prevStyle.scale * amount);
        const boundsVal = sortBounds(
          getFnValue(boundsRef.current, {
            scale: nextScale
          })
        );
        const [minX, maxX] = boundsVal.x;
        const [minY, maxY] = boundsVal.y;
        return {
          scale: nextScale,
          x: clamp(
            minX,
            maxX,
            clientX - initRect.left - parentDiff.left - xs * nextScale
          ),
          y: clamp(
            minY,
            maxY,
            clientY - initRect.top - parentDiff.top - ys * nextScale
          )
        };
      });
    }

    let wheelTimer = null;
    let wheelCalled = false;
    function onWheel(e) {
      e.preventDefault();
      const { clientX, clientY, deltaY } = e;
      zoom({ clientX, clientY }, deltaY);
      if (!wheelCalled) {
        getFnValue(cbRef.current.onZoomStart, e);
        wheelCalled = true;
      } else {
        getFnValue(cbRef.current.onZoom, e);
      }
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        getFnValue(cbRef.current.onZoomEnd, e);
        wheelCalled = false;
      }, 200);
    }

    let prevTouches = [];

    function onTouchStart(e) {
      isTouching = true;
      const touches = getTouches(e);
      prevTouches = [].map.call(touches, t => {
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
      const touches = getTouches(e);
      if (touches.length === 1) {
        const [touch] = touches;
        const delta = {
          x: touch.clientX - prevTouches[0].clientX,
          y: touch.clientY - prevTouches[0].clientY
        };

        setStyle(prevStyle => {
          const boundsVal = sortBounds(
            getFnValue(boundsRef.current, {
              scale: prevStyle.scale
            })
          );
          const [minX, maxX] = boundsVal.x;
          const [minY, maxY] = boundsVal.y;
          return {
            ...prevStyle,
            x: clamp(minX, maxX, prevStyle.x + delta.x),
            y: clamp(minY, maxY, prevStyle.y + delta.y)
          };
        });
        getFnValue(cbRef.current.onPan, e);
      } else if (touches.length === 2) {
        const prevPoints = prevTouches.slice(0, 2);
        if (prevPoints.length < 2) {
          getFnValue(cbRef.current.onZoomStart, e);
        } else {
          const points = [
            {
              clientX: touches[0].clientX,
              clientY: touches[0].clientY
            },
            {
              clientX: touches[1].clientX,
              clientY: touches[1].clientY
            }
          ];
          const prevTouchDis = distance2p(prevPoints);
          const touchDis = distance2p(points);
          const touchCenter = center2p(points);
          zoom(touchCenter, prevTouchDis - touchDis);
          getFnValue(cbRef.current.onZoom, e);
        }
      }
      prevTouches = [].map.call(touches, t => {
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
      }

      // hard to release all fingers at the same time ?
      if (prevTouches.length === 1) {
        getFnValue(cbRef.current.onPanEnd, e);
      } else if (prevTouches.length === 2) {
        getFnValue(cbRef.current.onZoomEnd, e);
      }

      const touches = getTouches(e);
      prevTouches = [].map.call(touches, t => {
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
    return () => {
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

  const setStyleWithClamp = useCallback(
    updater => {
      return setStyle(prevStyle => {
        let upVal = getFnValue(updater, prevStyle);
        const boundsVal = sortBounds(
          getFnValue(boundsRef.current, {
            scale: prevStyle.scale
          })
        );
        if (typeof upVal.x === 'number') {
          const [minX, maxX] = boundsVal.x;
          upVal.x = clamp(minX, maxX, upVal.x);
        }
        if (typeof upVal.y === 'number') {
          const [minY, maxY] = boundsVal.y;
          upVal.y = clamp(minY, maxY, upVal.y);
        }
        if (typeof upVal.scale === 'number') {
          upVal.scale = clamp(minScale, maxScale, upVal.scale);
        }

        return {
          ...prevStyle,
          ...upVal
        };
      });
    },
    [minScale, maxScale]
  );

  return {
    elemRef,
    style,
    setStyle: setStyleWithClamp
  };
}

export default usePanZoom;
