import { useRef, useState, useEffect, useCallback } from 'react';
import interact from 'interactjs';

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
  const sizeRef = useRef({
    width: 0,
    height: 0
  });
  const elemRef = useCallback(node => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      sizeRef.current = {
        width: rect.width,
        height: rect.height
      };
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
  const boundsRef = useRef();
  const cbRef = useRef();
  useEffect(() => {
    originRef.current = origin;
    boundsRef.current = sortBounds(
      getFnValue(bounds, {
        elem: elemDomRef.current,
        origin,
        style,
        size: sizeRef.current
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
          x: (rOrigin.x - ms.x) / ms.scale,
          y: (rOrigin.y - ms.y) / ms.scale
        };
        const elemSize = sizeRef.current;
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
          cbRef.current.onZoomStart && cbRef.current.onZoomStart(e);
          called = true;
        }
        clearTimeout(t);
        t = setTimeout(() => {
          cbRef.current.onZoomEnd && cbRef.current.onZoomEnd(e);
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
    function dragMoveListener(event, ds) {
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
    const int = interact(elemDomRef.current)
      .draggable({
        listeners: {
          start: event => {
            cbRef.current.onPanStart && cbRef.current.onPanStart(event);
          },
          move: event => {
            dragMoveListener(event);
            cbRef.current.onPan && cbRef.current.onPan(event);
          },
          end: event => {
            cbRef.current.onPanEnd && cbRef.current.onPanEnd(event);
          }
        }
      })
      .gesturable({
        listeners: {
          start: event => {
            setOrigin(event.page);
            cbRef.current.onZoomStart && cbRef.current.onZoomStart(event);
          },
          move: event => {
            setOrigin(event.page);
            zoom(event.ds);
            cbRef.current.onZoom && cbRef.current.onZoom(event);
          },
          end: event => {
            setOrigin(event.page);
            cbRef.current.onZoomEnd && cbRef.current.onZoomEnd(event);
          }
        }
      });
    return () => {
      int.unset();
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
