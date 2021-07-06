# ts-liveview v2-rc3

The successor to [ts-liveview v1](https://github.com/beenotung/ts-liveview/tree/v1).

Like the Phoenix LiveView, ts-liveview helps to deliver fast and interactive user interface that normally require javascript (MBs of js to be downloaded and executed on the client side) directly from the server.

JSX is supported but Virtual DOM is not required.

## Inspired from:

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript)
- [ts-liveview v1](https://github.com/beenotung/ts-liveview/tree/25f5476) (Typescript clone of Phoenix LiveView)
- [htmx](https://htmx.org) (Derived from [intercooler.js](https://intercoolerjs.org))
- JSX in [Surplus](https://github.com/adamhaile/surplus), [Stencil](https://stenciljs.com/docs/templating-jsx), and [React](https://reactjs.org/docs/react-without-jsx.html)

## Features

- [x] Support hybrid rendering mode
  - [x] Boot-time pre-rendering
  - [x] Request-time server-rendering [[1]](#1)
  - [x] Run-time live update [[2]](#2)
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Functional when javascript is disabled on client device [[3]](#3)
- [x] Support to dev with JSX, AST, or html template
- [x] Efficient wire format
- [x] Lightweight WebSocket-based protocol [(1.9K minified, 30x smaller than socket.io)](./size.md)
- [ ] Reliable connection (Auto send accumulated messages when network resume)

**Remarks**:

###### [1]

Response contentful html page directly to GET request

###### [2]

Triggered by events from server or other clients

###### [3]

For screen-reader, text-based browser, and people tried with privacy invading scripts

## Why JSX?

Previous versions of ts-liveview use [template string](https://github.com/beenotung/ts-liveview/blob/25f54760b378c0a0d8d2607bde4afa2878bb0ae6/test/demo-server-clock.ts#L11) to build html. It allows the engine to quickly construct the html output for [morphdom](https://github.com/patrick-steele-idem/morphdom) to patch the DOM.

With the template string based approach, html injection _could be_ avoided when explicitly using helper function to sanitize the dynamic content. However it requires the developer to be careful which could be bug-prone.

## Why no virtual-dom diff?

Current version updates the DOM using document query selector, this reduce the memory requirement on the server to supports simultaneous connections.

The application can be built on of reactive model powered by [S.js](https://github.com/adamhaile/S), [RxJS](https://github.com/ReactiveX/rxjs), or OOP with [getter and setter](https://vuejs.org/v2/guide/reactivity.html)

## Demo

- [x] [Thermostat](./server/app/pages/thermostat.tsx)
- [x] [Image Editor](./server/app/pages/editor.tsx)
- [x] [Autocomplete Searching](./server/app/pages/auto-complete-demo.tsx)
- [x] [Form and Sanitizing user-generated content](./server/app/pages/demo-form.tsx) (prevent XSS attack by default)
- [x] [Pre-rendered Page](./server/app/pages/home.tsx)
- [ ] Snake Game

Inspired from https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript

## Get Started

```bash
npm init ts-liveview my-app
cd my-app
pnpm install	# or `yarn install` or `npm install`
pnpm dev    	# or `yarn dev`     or `npm run dev`
```

Details refer to [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## License

This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
