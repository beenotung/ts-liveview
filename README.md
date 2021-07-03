# ts-liveview v3?

The successor to ts-liveview.

Like ts-liveview, ? helps to deliver fast and interactive user interface that normally require javascript (MBs of js to be downloaded and executed on the client side) directly from the server.

JSX is supported but Virtual DOM is not required.

## Why the rename?

I chose to rename the project for a few reasons:

- I wanted the freedom to clean up mistakes and remove ideas that hadn't worked out as cleanly as I wanted
-

## Inspired from:

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript)
- [ts-liveview](https://github.com/beenotung/ts-liveview/tree/25f5476) (Typescript clone of Phoenix LiveView)
- [htmx](https://htmx.org) (Derived from [intercooler.js](https://intercoolerjs.org))
- JSX in [Surplus](https://github.com/adamhaile/surplus), [Stencil](https://stenciljs.com/docs/templating-jsx), and [React](https://reactjs.org/docs/react-without-jsx.html)

## Features

- [x] Response contentful html page directly to GET request
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Realtime-update with server events
- [x] JSX support
- [x] Efficient wire format
- [x] Lightweight WebSocket [(1.9K minified, 30x smaller than socket.io)](./size.md)
- [ ] Reliable connection (Auto send accumulated messages when network resume)

## Why JSX?

Previous versions of ts-liveview use [template string](https://github.com/beenotung/ts-liveview/blob/25f54760b378c0a0d8d2607bde4afa2878bb0ae6/test/demo-server-clock.ts#L11) to build html. It allows the engine to quickly construct the html output for [morphdom](https://github.com/patrick-steele-idem/morphdom) to patch the DOM.

With the template string based approach, html injection _could be_ avoided when explicitly using helper function to sanitize the dynamic content. However it requires the developer to be careful which could be bug-prone.

## Demo

- [x] [Thermostat](./server/app/pages/thermostat.tsx)
- [x] [Image Editor](./server/app/pages/editor.tsx)
- [x] [Autocomplete Searching](./server/app/pages/auto-complete-demo.tsx)
- [x] [Form and Sanitizing user-generated content](./server/app/pages/demo-form.tsx) (prevent XSS attack by default)
- [ ] Snake Game

Inspired from https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript

## License

This is free and open-source software (FOSS) with
[BSD-2-Clause License](./LICENSE)
