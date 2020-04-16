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
        transform: `translate3d(${style.x}px, ${style.y}, 0) scale(${style.scale})`
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
- origin: (Object) transform origin based on whole viewport
  - x: (Number)
  - y: (Number)
- setOrigin: (Function) transform origin setter

options: (Object)

- minScale: (Number) minimum scale, default `-Infinity`
- maxScale: (Number) maximum scale, default `Infinity`
- bounds: (Object | Function) element position bounds
  ```js
  // object form
  bounds: {
    x: [-100, 100],
    y: [-100, 100]
  }
  // function form
  bounds: ({
    elem, // dom node
    origin, // current zoom origin
    style, // current element style
    size // current element size
  }) => {
    const parent = elem.parentElement.getBoundingClientRect();
    return {
      x: [-(style.scale * size.width - parent.width), 0],
      y: [-(style.scale * size.height - parent.height), 0]
    }
  }
  ```
  defaut
  ```js
  {
    x: [-Infinity, Infinity],
    y: [-Infinity, Infinity]
  }
  ```
- onPanStart: (Function) pan start callback
- onPan: (Function) panning callback
- onPanEnd: (Function) pan end callback
- onZoomStart: (Function) zoom start callback
- onZoom: (Function) zooming callback
- onZoomEnd: (Function) zoom end callback

## FAQ

- multiple refs integration

```js
const App = () => {
  const myRef = useRef();
  const { elemRef, style } = usePanZoom();

  return (
    <div
      ref={node => {
        myRef.current = node;
        elemRef(node);
      }}
      style={{
        transform: `translate3d(${style.x}px, ${style.y}, 0) scale(${style.scale})`
      }}
    />
  );
};
```
