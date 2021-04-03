# ts-liveview v3?

The successor to ts-liveview.

Like ts-liveview, ? helps to deliver fast and interactive user interface that normally require javascript (MBs of js to be downloaded and executed on the client side) directly from the server.

## Why the rename?

I chose to rename the project for a few reasons:

- I wanted the freedom to clean up mistakes and remove ideas that hadn't worked out as cleanly as I wanted
-

## Inspired from:

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript)
- [ts-liveview](https://github.com/beenotung/ts-liveview/tree/25f5476) (Typescript clone of Phoenix LiveView)
- [htmx](https://htmx.org) (Derived from [intercooler.js](https://intercoolerjs.org))
- JSX in [Surplus](https://github.com/adamhaile/surplus), [Stencil](https://stenciljs.com/docs/templating-jsx), and [React](https://reactjs.org/docs/react-without-jsx.html)

## Why JSX?

Previous versions of ts-liveview use [template string](https://github.com/beenotung/ts-liveview/blob/25f54760b378c0a0d8d2607bde4afa2878bb0ae6/test/demo-server-clock.ts#L11) to build html. It allows the engine to quickly construct the html output for [morphdom](https://github.com/patrick-steele-idem/morphdom) to patch the DOM.

With the template string based approach, html injection _could be_ avoided when explicitly using helper function to sanitize the dynamic content. However it requires the developer to be careful which could be bug-prone.

## Demo

- [ ] Thermostat
- [ ] Image Editor
- [ ] Autocomplete Searching
- [ ] Form Validations
- [ ] Snake Game
