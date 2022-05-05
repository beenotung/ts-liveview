# ts-liveview

> ts-liveview helps to deliver fast and interactive user interface directly from node.js server.

_(Without MBs of javascript to be downloaded and executed on the client side.)_

The client-side runtime of ts-liveview is below 12KB (2.2KB bundled, minified and gzipped).

ts-liveview supports [`JSX`](#jsx) but it **[doesn't rely on Virtual DOM](#no-vdom-diff)**. Instead, precise DOM operations are derived from application-specific event handlers, and sent to the browser client(s) for realtime UI updates.

## Get Started

```bash
npm init ts-liveview my-app
cd my-app
pnpm install	# or `yarn install` or `npm install`
pnpm dev    	# or `yarn dev`     or `npm run dev`
```

Details refer to [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## Features

- [x] Support hybrid rendering mode
  - [x] Boot-time pre-rendering [[1]](#feature-1)
  - [x] Request-time server-rendering with HTML [streaming](#html-streaming) [[2]](#feature-2)
  - [x] Run-time live update [[3]](#feature-3)
- [x] Support url-based routing architectures
  - [x] Multi-Page Application (MPA)
  - [x] Single-Page Application (SPA) [[4]](#feature-4)
  - [x] Hybrid of SPA and MPA
  - [x] Write UI and API routing once in one place
  - [x] Nested routing
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Still functional when javascript is disabled on client device [[5]](#feature-5)
- [x] Support to develop with [JSX](#jsx), AST, or html template
- [x] Efficient wire format
- [x] Lightweight WebSocket-based protocols [[6]](#feature-6)
- [ ] Reliable connection
  - [x] Auto reconnect when network resume
  - [ ] Auto send accumulated offline messages when network resume (WIP)
- [x] Work well with express.js [[7]](#feature-7)
- [x] Fully customizable [[8]](#feature-8)

**Remarks**:

<span id='feature-1'>[1]</span> Pay the AST-to-HTML conversion time-cost once at boot-time instead of at each request-time

<span id='feature-2'>[2]</span> Response contentful html page directly to GET request. Content chunk is streamed to clients as soon as it's ready, without waiting for client-side javascript bundles nor data requests to start rendering.

<span id='feature-3'>[3]</span> Updates can be triggered by (bi-directional) events from the server or other clients

<span id='feature-4'>[4]</span> With `history.pushState()` and `PopStateEvent`

<span id='feature-5'>[5]</span> For screen-reader, text-based browser, and people with slow or unstable network, or simply tried with privacy invading scripts

<span id='feature-6'>[6]</span> The network client code is [0.4K to 0.9K minified, 102x to 45x smaller than socket.io.min.js](./size.md)

<span id='feature-7'>[7]</span> The entry point of ts-liveview app can be wrapped as an express middleware

<span id='feature-8'>[8]</span> ts-liveview is provided as a template (rather than a library), hence any part can be modified to suit your need

## Why server-rendered?

- To deliver initial meaningful paint as soon as possible (response contentful HTML to HTTP GET request, not just skeleton demanding further script and ajax request)

- To avoid over-bloating the amount of javascript needed to download and execute by the client browser

- Enable server-driven feature flags, the client only downloads relevant content of the current page

- To allow 'over-the-air' updates of application state and deployment

<span id='html-streaming'></span>

### Why HTML Streaming?

HTML Streaming enables progressive rendering. The server sends html chunks as soon as they're ready. The browser, on the other side, progressively receives and renders the content. As a result, the content will be visible to users earlier.

Below simulation from [marko](https://markojs.com) illustrates the visual difference with/without html streaming. In the example, both sides take the same amount of time to finish rendering. However, the right-hand-side example using html streaming shows the contents progressively, allowing the user to start reading earlier.

<figure>
  <p>
    <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--ZZf0krqi--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_66%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/strm6tlc0vcjc5xzwcbu.gif" alt="Buffered pages don’t show content as it loads, but streaming pages show content incrementally." loading="lazy">
  </p>
  <figcaption>
    <p>
      Illustration captured by
      <a href="https://dev.to/tigt/the-weirdly-obscure-art-of-streamed-html-4gc2">Taylor Hunt</a>
      from
      <a href="https://markojs.com/#streaming">markojs.com/#streaming</a>
    </p>
  </figcaption>
</figure>

<span id='jsx'></span>

## Why JSX?

Previous versions of ts-liveview use [template string](https://github.com/beenotung/ts-liveview/blob/25f54760b378c0a0d8d2607bde4afa2878bb0ae6/test/demo-server-clock.ts#L11) to build html. It allows the engine to quickly construct the html output for [morphdom](https://github.com/patrick-steele-idem/morphdom) to patch the DOM.

With the template string based approach, html injection (XSS attack) _could be_ avoided when explicitly using helper function to sanitize the dynamic content. However it requires the developer to be careful, which could be bug-prone.

Using JSX, the string values are auto escaped, which helps to prevent XSS from dynamic content.

### Why not using html-based template language?

One may find it more productive to work with html-based template language like ember/angular/vue/svelte.
However, interpreting/compiling a DSL with looping ability, conditional branching, scoped variables, reusability and testability into low-level code is rather complex.

Instead, ts-liveview adopts a data structure DSL (dsDSL) built on the primitive data structures provided from the programming language, such as string, array, object and function.

A thin abstraction layer is created to improve development experience (DX).

This [article](https://www.toptal.com/software/declarative-programming) from Federico explains the pros and cons of declarative programming and dsDSL in detail.

<span id="no-vdom-diff"></span>

## Why no virtual-dom diff?

The current implementation of ts-liveview updates the DOM using explicit css selector (aka document querySelector). This design reduces the memory requirement on the server to better support simultaneous connections.

The application can be built on top of reactive model powered by [S.js](https://github.com/adamhaile/S), [RxJS](https://github.com/ReactiveX/rxjs), or OOP with [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) and [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set).

Example using _getter and setter_ see [thermostat.tsx](./server/app/pages/thermostat.tsx)

## Examples / Demo

- [x] [Thermostat](./server/app/pages/thermostat.tsx)
- [x] [Image Editor](./server/app/pages/editor.tsx)
- [x] [Autocomplete Searching](./server/app/pages/auto-complete-demo.tsx)
- [x] [Form and Sanitizing user-generated content](./server/app/pages/demo-form.tsx) (prevent XSS attack by default)
- [x] [Pre-rendered Page](./server/app/pages/home.tsx)
- [x] [SPA with url-based routing](./server/app/app.tsx)
- [x] [Chatroom](./server/app/pages/chatroom.tsx) with locales and timezone support
- [x] [Realtime Collaborative Painting](https://github.com/beenotung/live-paint)
- [ ] Snake Game

## Inspired from

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript) for the idea of initial html response and realtime updates over websocket
- [ts-liveview v1](https://github.com/beenotung/ts-liveview/tree/v1) (Typescript clone of Phoenix LiveView with template-string based diff-patching and s-js powered state change detection)
- attribute-based event handling in [htmx](https://htmx.org) (Derived from [intercooler.js](https://intercoolerjs.org))
- JSX in [Surplus](https://github.com/adamhaile/surplus), [Stencil](https://stenciljs.com/docs/templating-jsx), and [React](https://reactjs.org/docs/react-without-jsx.html)
- HTML Streaming motivation from [Ryan](https://dev.to/ryansolid)

## Releases

Details refers to [Changelog](./CHANGELOG.md)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software (FLOSS). It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
