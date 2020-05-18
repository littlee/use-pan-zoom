import { useRef, useState, useEffect, useCallback } from 'react';

function clamp(min, max, value) {
  if (min > max) {
    throw new Error(
      'min must not be greater than max in clamp(min, max, value)'
    );
  }
  return value < min ? min : value > max ? max : value;
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

function tryCall(fn, ...args) {
  if (typeof fn === 'function') {
    return fn(...args);
  }
}

function distance2p([p1, p2]) {
  return Math.sqrt(
    Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2)
  );
}

function center2p([p1, p2]) {
  return {
    x: (p1.clientX + p2.clientX) / 2,
    y: (p1.clientY + p2.clientY) / 2
  };
}

function getInsideTouch(size, style, touches) {
  const rect = {
    x: style.x,
    y: style.y,
    width: size.width * style.scale,
    height: size.height * style.scale
  };
  return [].filter.call(touches, item => {
    return (
      item.clientX >= rect.x &&
      item.clientX <= rect.x + rect.width &&
      item.clientY >= rect.y &&
      item.clientY <= rect.y + rect.height
    );
  });
}

function getMoveDelta(touch, prevTouch) {
  if (touch.identifier !== prevTouch.identifier) {
    return { x: 0, y: 0 };
  }
  return {
    x: touch.clientX - prevTouch.clientX,
    y: touch.clientY - prevTouch.clientY
  };
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
  const elemDomRef = useRef();
  const elemRectRef = useRef({
    width: 0,
    height: 0
  });
  const elemRef = useCallback(node => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      elemRectRef.current = rect;
      elemDomRef.current = node;
    }
  }, []);
  const [origin, setOrigin] = useState({
    x: 0,
    y: 0
  });
  const [style, setStyle] = useState({
    x: 0,
    y: 0,
    scale: 1
  });

  // ref copy
  const originRef = useRef();
  const styleRef = useRef();
  const boundsRef = useRef();
  const cbRef = useRef();
  useEffect(() => {
    originRef.current = origin;
    styleRef.current = style;
    boundsRef.current = sortBounds(
      getFnValue(bounds, {
        elem: elemDomRef.current,
        origin,
        style,
        rect: elemRectRef.current
      })
    );
    cbRef.current = {
      onPanStart,
      onPan,
      onPanEnd,
      onZoomStart,
      onZoom,
      onZoomEnd
    };
  });

  const zoom = useCallback(
    ds => {
      const rOrigin = originRef.current;
      const rBounds = boundsRef.current;
      setStyle(ms => {
        const nextScale = clamp(minScale, maxScale, ms.scale + ds);
        const clampDs = nextScale - ms.scale;
        const dot = {
          x: (rOrigin.x - ms.x) / nextScale,
          y: (rOrigin.y - ms.y) / nextScale
        };
        const elemSize = elemRectRef.current;
        const accX = elemSize.width * clampDs * (dot.x / elemSize.width);
        const accY = elemSize.height * clampDs * (dot.y / elemSize.height);
        const nextX = clamp(rBounds.x[0], rBounds.x[1], ms.x - accX);
        const nextY = clamp(rBounds.y[0], rBounds.y[1], ms.y - accY);
        return {
          ...ms,
          scale: nextScale,
          x: nextX,
          y: nextY
        };
      });
    },
    [maxScale, minScale]
  );
  useEffect(() => {
    const $elem = elemDomRef.current;
    let t = null;
    let called = false;
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
        t = setTimeout(() => {
          tryCall(cbRef.current.onZoomEnd, e);
          called = false;
        }, 200);

        const ds = -1 * e.deltaY * 0.005;
        setOrigin({
          x: e.clientX,
          y: e.clientY
        });
        zoom(ds);
      }
    }
    $elem.addEventListener('wheel', onWheel);
    return () => {
      clearTimeout(t);
      $elem.removeEventListener('wheel', onWheel);
    };
  }, [zoom]);

  useEffect(() => {
    function dragMoveListener(event) {
      setStyle(ms => {
        const rBounds = boundsRef.current;
        const nextX = clamp(rBounds.x[0], rBounds.x[1], ms.x + event.dx);
        const nextY = clamp(rBounds.y[0], rBounds.y[1], ms.y + event.dy);
        return {
          ...ms,
          x: nextX,
          y: nextY
        };
      });
    }

    const $elem = elemDomRef.current;
    let prevTouch = {};
    let prevZoomTouch = [];

    function onTouchStart(e) {
      e.preventDefault();
      const touches = getInsideTouch(
        elemRectRef.current,
        styleRef.current,
        e.touches
      );
      // pan
      if (touches.length === 1) {
        const [touch] = e.touches;
        tryCall(cbRef.current.onPanStart, e);
        prevTouch = touch;
      }
      // zoom
      else if (touches.length >= 2) {
        const touchCenter = center2p(touches);
        setOrigin(touchCenter);
        tryCall(cbRef.current.onZoomStart, e);
        prevTouch = touches[0];
        prevZoomTouch = touches;
      }
    }

    function onTouchMove(e) {
      e.preventDefault();
      const touches = getInsideTouch(
        elemRectRef.current,
        styleRef.current,
        e.touches
      );
      // pan
      if (touches.length === 1) {
        const [touch] = touches;
        const delta = getMoveDelta(touch, prevTouch);
        dragMoveListener({
          dx: delta.x,
          dy: delta.y
        });
        tryCall(cbRef.current.onPan, e);
        prevTouch = touch;
      }
      // zoom
      else if (touches.length >= 2) {
        const touchCenter = center2p(touches);
        const dis = distance2p(touches);
        const prevDis = distance2p(prevZoomTouch);
        const deltaDis = dis - prevDis;

        setOrigin(touchCenter);
        zoom(deltaDis * 0.005);
        tryCall(cbRef.current.onZoom, e);
        prevTouch = touches[0];
        prevZoomTouch = touches;
      }
    }

    function onTouchEnd(e) {
      e.preventDefault();
      const touches = getInsideTouch(
        elemRectRef.current,
        styleRef.current,
        e.changedTouches
      );
      // pan
      if (touches.length === 1) {
        tryCall(cbRef.current.onPanEnd, e);
      }
      // zoom
      else if (touches.length >= 2) {
        tryCall(cbRef.current.onZoomEnd, e);
      }
    }

    $elem.addEventListener('touchstart', onTouchStart);
    $elem.addEventListener('touchmove', onTouchMove);
    $elem.addEventListener('touchend', onTouchEnd);

    return () => {
      $elem.removeEventListener('touchstart', onTouchStart);
      $elem.removeEventListener('touchmove', onTouchMove);
      $elem.removeEventListener('touchend', onTouchEnd);
    };
  }, [zoom]);

  return {
    elemRef,
    origin,
    setOrigin,
    style,
    setStyle
  };
}

export default usePanZoom;
