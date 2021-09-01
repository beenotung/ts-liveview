# ts-liveview

ts-liveview helps to deliver fast and interactive user interface directly from the node.js server.

_(Without MBs of javascript to be downloaded and executed on the client side.)_

The client-side runtime of ts-liveview is below 13KB (2.5KB bundled, minified and gzipped).

ts-liveview supports `JSX` but it **doesn't rely on Virtual DOM**. Instead, precise DOM operations are derived from application-specific event handlers, and sent to the browser client for realtime UI update.

## Get Started

```bash
npm init ts-liveview my-app
cd my-app
pnpm install	# or `yarn install` or `npm install`
pnpm dev    	# or `yarn dev`     or `npm run dev`
```

## Inspired from

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript)
- [ts-liveview v1](https://github.com/beenotung/ts-liveview/tree/v1) (Typescript clone of Phoenix LiveView with template-string based diff-patching and s-js powered state change detection)
- [htmx](https://htmx.org) (Derived from [intercooler.js](https://intercoolerjs.org))
- JSX in [Surplus](https://github.com/adamhaile/surplus), [Stencil](https://stenciljs.com/docs/templating-jsx), and [React](https://reactjs.org/docs/react-without-jsx.html)

## Features

- [x] Support hybrid rendering mode
  - [x] Boot-time pre-rendering [[0]](#0)
  - [x] Request-time server-rendering [[1]](#1)
  - [x] Run-time live update [[2]](#2)
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Still functional when javascript is disabled on client device [[3]](#3)
- [x] Support to develop with JSX, AST, or html template
- [x] Efficient wire format
- [x] Lightweight WebSocket-based protocols [(0.5K to 1.9K minified, 128x to 33x smaller than socket.io)](./size.md)
- [ ] Reliable connection (Auto send accumulated messages when network resume)

**Remarks**:

<span id='0'>[0]</span> Pay the AST-to-HTML conversion time-cost once at boot-time instead of at each request-time

<span id='1'>[1]</span> Response contentful html page directly to GET request

<span id='2'>[2]</span> Triggered by events from server or other clients

<span id='3'>[3]</span> For screen-reader, text-based browser, and people tried with privacy invading scripts

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
- [x] [SPA with routing](./server/app/app.tsx)
- [x] [Chatroom](./server/app/pages/chatroom.tsx) with locales and timezone support
- [ ] Snake Game

Inspired from https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript

Details refer to [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## License

This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
