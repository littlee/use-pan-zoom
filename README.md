# use-pan-zoom

React hook for panning & zooming element

## Install

```
npm i -S use-pan-zoom
```

## Usage

```js
import React from 'react';
import usePanZoom from 'use-pan-zoom';

const App = () => {
  const { elemRef, style } = usePanZoom();

  return (
    <div
      ref={elemRef}
      style={{
        touchAction: 'none',
        transformOrigin: '0 0',
        transform: `translate3d(${style.x}px, ${style.y}px, 0) scale(${style.scale})`
      }}
    />
  );
};
```

## API

```js
const values = usePanZoom(options);
```

values: (Object)

- elemRef: (Function) a React Callback Ref https://reactjs.org/docs/refs-and-the-dom.html#callback-refs
- style: (Object)
  - x: (Number) x position
  - y: (Number) y position
  - scale: (Number) scale ratio
- setStyle: (Function) style setter

options: (Object)

- minScale: (Number) minimum scale, default `-Infinity`
- maxScale: (Number) maximum scale, default `Infinity`
- bounds: (Object: {x?: [Number, Number], y?: [Number, Number]} | Function: () => Object) element position bounds, default: `{ x: [-Infinity, Infinity], y: [-Infinity, Infinity] }`
- onPanStart: (Function(event)) pan start callback
- onPan: (Function(event)) panning callback
- onPanEnd: (Function(event)) pan end callback
- onZoomStart: (Function(event)) zoom start callback
- onZoom: (Function(event)) zooming callback
- onZoomEnd: (Function(event)) zoom end callback

## FAQ

- multiple refs integration

```js
const App = () => {
  const myRef = useRef();
  const { elemRef } = usePanZoom();

  return (
    <div
      ref={node => {
        myRef.current = node;
        elemRef(node);
      }}
    />
  );
};
```
