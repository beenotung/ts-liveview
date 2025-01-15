# ts-liveview

**Build hybrid SSG and SSR realtime SPA/MPA with Typescript**

> ts-liveview helps to deliver fast and interactive user interface directly from node.js server.

_(Without MBs of javascript to be downloaded and executed on the client side.)_

The client-side runtime of ts-liveview is below 13KB (2.3KB bundled, minified and gzipped).

ts-liveview supports [`JSX`](#jsx) but it **[doesn't rely on Virtual DOM](#no-vdom-diff)**. Instead, precise DOM operations are derived from application-specific event handlers, and sent to the browser client(s) for realtime UI updates.

[中文版本](./README-zh.md)

## Get Started

To create a new project, run:

```bash
## start from a template
npm init ts-liveview my-app
# or "npx create-ts-liveview@latest my-app" for latest version

cd my-app

## install packages and setup sqlite database
./scripts/init.sh

## starts the development server
npm start
```

To setup a cloned project, run `./scripts/init.sh`, which will install packages and setup sqlite database for you.

To update database schema, see [db/README.md](./db/README.md)

To deploy, setup [scripts/config](./scripts/config) then run `./scripts/deploy.sh`, which will build and deploy the server with knex migrate and pm2.

To test https-required functions during development, run `./scripts/caddy-run.sh`, which will start a https reverse proxy.
You can install caddy with `./scripts/caddy-install.sh` on Mac or Linux, or `./scripts/caddy-install.ps1` on Windows.

Details refer to [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## Available npm scripts

`npm start`:
Start the development server, with realtime-update and live-reload.

`npm run build`:
Compile the typescript server into 'dist' folder, and bundle the client into 'build' folder.
This step is only needed when preparing production deployment.

`npm run fix`:
Auto add `.js` extension in import paths, which is required in esm runtime.

`npm run format`:
Auto format the source code with prettier.

`npm run lint`:
Lint the codebase with eslint and apply auto fix if possible.

`npm run size`:
Build the frontend and check the size of bundled, minified, and gzipped versions respectively.

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
  - [x] Sync / async routes
  - [x] Static / dynamic document title and description meta
  - [x] Type-Safe routing with inferred static type checking
- [x] Follow the DOM convention
  - [x] `class`, `style`, `onclick` e.t.c. are string attributes, with helper functions to convert from objects
  - [x] Compatible with css frameworks and web components (doesn't require framework specific wrappers unlike react)
  - [x] Support inline script and Immediately Invoked Function Expression (IIFE）
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Only load client-side library on used pages, for example:
  - [x] image compression (preview & upload)
  - [x] sweetalert (unrestricted)
  - [x] swiper (slides / images carousel)
  - [x] chart.js (canvas based line chart, bar chart, and more)
  - [x] canvas-confetti (fireworks animation)
  - [x] DataTables (pagination / search)
- [x] Still functional when javascript is disabled on client device with links and forms [[5]](#feature-5)
- [x] Support to develop with [JSX](#jsx), AST, component, or html template
- [x] Error boundary for each component [[6]](#feature-6)
- [x] Code Minification
  - [x] Minify CSS & JS with esbuild
  - [x] Minify HTML fragment with AST converter
  - [x] Minify in production mode, skip in development mode
  - [x] Memorized to speed up
  - [x] Allow skipping minimization for dynamic and short code
- [x] Efficient wire format
- [x] Lightweight WebSocket-based protocols [[7]](#feature-7)
- [ ] Reliable connection
  - [x] Auto reconnect when network resume
  - [ ] Auto send accumulated offline messages when network resume (WIP)
- [x] Work well with express.js [[8]](#feature-8)
- [x] Built-in locale support (language and timezone)
- [x] Fully customizable [[9]](#feature-9)
- [x] Multiple starter templates
  - [x] v5-demo (kitchen sink demos)
  - [x] v5-minimal-template (single page starter)
  - [x] v5-minimal-without-db-template
  - [x] v5-web-template (mobile-responsive webapp)
  - [x] v5-ionic-template (mobile-first webapp)
  - [x] v5-hybrid-template (switchable between of web and ionic template)
  - [x] v5-auth-template (extends hybrid-template with user login/register and email verification and protected routes)
  - [x] v5-auth-web-template (responsive web version auth template)
  - [x] v5-auth-ionic-template (mobile-first version auth template)

**Remarks**:

<span id='feature-1'>[1]</span>
Pay the AST-to-HTML conversion time-cost once at boot-time instead of at each request-time

<span id='feature-2'>[2]</span>
Response contentful html page directly to GET request. Content chunk is streamed to clients as soon as it's ready, without waiting for client-side javascript bundles nor data requests to start rendering.

<span id='feature-3'>[3]</span>
Updates can be triggered by (bi-directional) events from the server or other clients

<span id='feature-4'>[4]</span>
With `history.pushState()` and `PopStateEvent`

<span id='feature-5'>[5]</span>
For screen-reader, text-based browser, and people with slow or unstable network, or simply tried with privacy invading scripts

<span id='feature-6'>[6]</span>
Each function component are evaluated with error handling, this approach can deliver as much as possible, avoiding blank pages when error occur.

<span id='feature-7'>[7]</span>
The network client code is [0.4K to 0.9K minified, 102x to 45x smaller than socket.io.min.js](./size.md)

<span id='feature-8'>[8]</span>
The entry point of ts-liveview app can be wrapped as an express middleware

<span id='feature-9'>[9]</span>
ts-liveview is provided as a template (rather than a library), hence any part can be modified to suit your need

## Size Comparison with other tools

| Tools             | Runtime Code Size (minified)       |
| ----------------- | ---------------------------------- |
| Vanilla           | 0.3K                               |
| **ts-liveview 4** | **6.5K** _OR_ same size as vanilla |
| Stencil 2.0.1     | 13.7K                              |
| Svelte 3.0.0      | 17.4K                              |
| Vue 3.2.33        | 49.3K                              |
| React 17.0.2      | 144.6K                             |
| Angular 13.3.0    | 155.8K                             |

Remark:
Size of other tools taking reference from https://github.com/beenotung/spa-state-demo

## Q & A

### Why server-rendered?

- To deliver initial meaningful paint as soon as possible (response contentful HTML to HTTP GET request, not just skeleton demanding further script and ajax request)

- To avoid over-bloating the amount of javascript needed to download and execute by the client browser

- Enable server-driven feature flags, the client only downloads relevant content of the current page

- To allow 'over-the-air' updates of application state and deployment

<span id='html-streaming'></span>

#### Why HTML Streaming?

HTML Streaming enables progressive rendering. The server sends html chunks as soon as they're ready. The browser, on the other side, progressively receives and renders the content. As a result, the content will be visible to users earlier.

Below simulation from [marko](https://markojs.com) illustrates the visual difference with/without html streaming. In the example, both sides take the same amount of time to finish rendering. However, the right-hand-side example using html streaming shows the contents progressively, allowing the user to start reading earlier.

<figure>
  <p>
    <img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/strm6tlc0vcjc5xzwcbu.gif" alt="Buffered pages don’t show content as it loads, but streaming pages show content incrementally." loading="lazy">
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

Despite the response body is sent with streaming, the document title and meta description can be generated dynamically according to routing result. Details see the Thermostat and routing [demo](#examples--demo).

<span id='jsx'></span>

### Why JSX?

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

### Why no virtual-dom diff?

The current implementation of ts-liveview updates the DOM using explicit css selector (aka document querySelector). This design reduces the memory requirement on the server to better support simultaneous connections.

The application can be built on top of reactive model powered by [S.js](https://github.com/adamhaile/S), [RxJS](https://github.com/ReactiveX/rxjs), or OOP with [getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) and [setter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set).

Example using _getter and setter_ see [thermostat.tsx](./server/app/pages/thermostat.tsx)

## Template of common use cases

- [x] Foldable Navbar (mobile responsive)
- [x] Foldable Sidebar (mobile responsive)
- [x] Bottom Tabbar (ionic mobile)
- [x] Login / Register (branch: v5-auth-template)
- [ ] OAuth
- [x] Email verification
- [x] SMS verification
- [ ] Reset password
- [ ] Login History

## Examples / Demo

- [x] Thermostat [[source](./server/app/pages/thermostat.tsx) | [demo](https://liveviews.cc/thermostat)]
- [x] Image Editor [[source](./server/app/pages/editor.tsx) | [demo](https://liveviews.cc/editor)]
- [x] Autocomplete Searching [[source](./server/app/pages/auto-complete-demo.tsx) | [demo](https://liveviews.cc/auto-complete)]
- [x] Form and Sanitizing user-generated content (prevent XSS attack by default) [[source](./server/app/pages/demo-form.tsx) | [demo](https://liveviews.cc/form)]
- [x] Pre-rendered Page [[source](./server/app/pages/home.tsx) | [demo](https://liveviews.cc/)]
- [x] SPA with url-based routing [source: [app.tsx](./server/app/app.tsx), [routes.tsx](./server/app/routes.tsx), [menu.tsx](./server/app/menu.tsx) | [demo](https://liveviews.cc/)]
- [x] Chatroom with locales and timezone support [source: [chatroom.tsx](./server/app/pages/chatroom.tsx) | [demo](https://liveviews.cc/chatroom)]
- [x] Chatroom with database and realtime update [[source](https://github.com/beenotung/live-chat)]
- [x] User Agents from sqlite3 database [[source](./server/app/pages/user-agents.tsx) | [demo](https://liveviews.cc/user-agents)]
- [x] Image compression and file uploading [[source](./server/app/pages/demo-upload.tsx)] | [demo](https://liveviews.cc/upload)]
- [x] Realtime Collaborative Painting [[source](https://github.com/beenotung/live-paint) | [demo](https://paint.liveviews.cc)]
- [x] Hacker News Clone [[source](https://github.com/beenotung/liveview-hn) | [demo](https://hn.liveviews.cc)]
- [x] Multi-Player Apple Chess Board Game [[source](https://github.com/beenotung/live-chess) | [demo](https://chess.liveviews.cc/)]

Examples to be done:

- [ ] Snake game
- [ ] Blog with headline image
- [ ] Landing page with contact form
- [ ] Survey form
- [ ] Content marketing with lead magnet

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
