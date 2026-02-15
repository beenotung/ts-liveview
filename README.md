# ts-liveview

**Build hybrid SSG and SSR realtime SPA/MPA with Typescript**

> ts-liveview helps to deliver fast and interactive user interface directly from node.js server.

_(Without MBs of javascript to be downloaded and executed on the client side.)_

The client-side runtime of ts-liveview is below 13KB (2.3KB bundled, minified and gzipped).

ts-liveview supports [`JSX`](#jsx) but it **[doesn't rely on Virtual DOM](#no-vdom-diff)**. Instead, precise DOM operations are derived from application-specific event handlers, and sent to the browser client(s) for realtime UI updates.

[简体中文](./README-zh-cn.md) | [繁體中文](./README-zh-hk.md)

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

To test https-required functions during development (e.g., camera, microphone):

1. Install caddy: `./scripts/caddy-install.sh` (Mac/Linux) or `./scripts/caddy-install.ps1` (Windows)
2. Enable the caddy https proxy in `.env` file: `CADDY_PROXY=enable`

Details refer to [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

For team onboarding and detailed patterns, see [docs/developer-guide.md](./docs/developer-guide.md).

## Configuration

- Environment variables: `.env` (see [.env.example](./.env.example) and [server/env.ts](./server/env.ts))
- Site settings: [server/config.ts](./server/config.ts)
- Database schema: [db/README.md](./db/README.md)

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
  - [x] Support inline script and Immediately Invoked Function Expression (IIFE)
- [x] Enable interactive UI with minimal amount of javascript to be downloaded
- [x] Load only what you need, when you need it
  - [x] **Built-in libraries**:
    - [x] image compression (preview & upload)
    - [x] sweetalert (unrestricted)
    - [x] swiper (slides / images carousel)
    - [x] chart.js (canvas based line chart, bar chart, and more)
    - [x] canvas-confetti (fireworks animation)
    - [x] DataTables (pagination / search)
  - [x] **Custom client-side code**:
    - [x] Simple code: use JavaScript inline within pages
    - [x] Organized code: use TypeScript modules for type checking
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
- [x] CSRF protection via `SameSite=Lax` cookies (in auth templates)
- [x] Multi-dimensional rate limiting with token bucket algorithm (IP, user, target, global)
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

## Custom Client-Side Code for Complex Interactions

While ts-liveview is designed for a server-centric experience, it doesn't limit you to simple interactions. For client-side logic, you have two approaches:

**Simple code**: Write JavaScript inline within your pages for quick, direct functionality.

**Organized code**: Use TypeScript modules for more complex flows where type checking helps maintain code quality. Load them via the `loadClientPlugin` function, which allows you to:

- Write code in TypeScript (instead of JavaScript strings inline)
- Import other files and npm packages
- Bundle code specifically for that page

The bundle is only loaded on pages that use it, so initial loading times for other pages remain fast.

**Concrete Examples:**

- **Canvas Animations**: Use `canvas-confetti` for interactive fireworks and particle effects
- **Rich UI Components**: Integrate `sweetalert2` for advanced modal dialogs and notifications
- **Real-time Media Processing**: Build custom AI-powered features like:
  - MediaPipe for real-time face landmark detection, hand tracking, and gesture recognition
  - TensorFlow.js for on-device machine learning inference
  - WebRTC for live video streaming with real-time analysis
  - Canvas-based rendering for custom visualizations and games

See the [Client-Side Library Integrations Demo](./server/app/pages/demo-plugin.tsx) for examples of third-party library integrations and the [TypeScript Page Demo](./server/app/pages/demo-typescript-page.tsx) for complex custom features like camera streams and AI models.

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

## Rate Limiting

Configure in [server/rate-limits.ts](./server/rate-limits.ts). Uses token bucket algorithm with dimensions: IP, user, target (email/phone), and global.

### Configuration

```typescript
{
  capacity: number    // Burst limit
  interval: number    // Refill interval (use SECOND / N for N req/s)
  cooldown?: number   // Min time between requests (default: 0)
}
```

### Usage

```typescript
import { getRateLimitContext } from '../rate-limit.js'
import { api_rate_limit, email_rate_limit } from '../rate-limits.js'

let ctx = getRateLimitContext(context)
api_rate_limit.consume(ctx) // throws 429 if limited

// For email/SMS OTP sending, use target to limit per recipient:
email_rate_limit.consume({ ...ctx, target: email })
```

## Quick Example

Before writing pages, note these patterns to help avoid common pitfalls. See the full guide in [Get Started](#get-started) above.

### Style and Script placement

Import `Style` and `Script` from the components. For multi-line scripts, define at top level (like Style). The `Script` component minifies in production and skips minification in development for readability when debugging.

```tsx
import Style from '../components/style.js'
import Script from '../components/script.js'

let style = Style(/* css */ `
#my-page button {
  margin: 0.5rem;
}
`)
let script = Script(/* js */ `
function showGreeting() {
  greeting.textContent = 'Hello!'
}
`)
function Page() {
  return (
    <>
      {style}
      <div id="my-page">
        <span id="greeting"></span>
        <button onclick="showGreeting()">Say Hello</button>
      </div>
      {script}
    </>
  )
}
```

**Tips:**

You can have multiple nodes as needed. Style scoping (e.g. `#my-page button { ... }`) is less critical for pages but helpful for reusable components.

`onclick` is an HTML attribute (string), not a React-style callback — use `onclick="functionName()"`.

Elements with an `id` are exposed as global variables (e.g. `greeting` for `id="greeting"`).

Single-line value assignment is fine inline. For a select's initial value:

```tsx
{Script(`form.field.value=${JSON.stringify(value)}`)}
```

### Map/Loop in JSX

`{items.map(...)}` is **invalid** — a plain array does not match the expected AST structure. Import `mapArray` from `../components/fragment.js` and use either:

```tsx
{mapArray(items, item => (
  <li>{item.name}</li>
))}
```

Or wrap with extra brackets:

```tsx
{[items.map(item => (
  <li>{item.name}</li>
))]}
```

`mapArray(array, fn, separator?)` — the optional third parameter is a delimiter; it can be any node (including strings), e.g. `', '`, `' | '`, or `<br />`.

### Prefer `Script` component over raw `<script>` tag

A raw `<script>` tag with template literals also works, but the `Script` component is preferred for minification and caching. For server communication, use the global `emit(url, ...args)` function (defined in client/index.ts).

```tsx
// Works, but prefer Script component
<script>{`
function inc() {
  testBtn.textContent++
}
`}</script>

// Preferred: Script component
let script = Script(/* js */ `
function inc() {
  testBtn.textContent++
}
`)
```

## Examples / Demo

### Libraries & Integrations

- [x] **Client-side library integrations demo** (confetti, sweetalert, charts, swiper, datatables) [[source](./server/app/pages/demo-plugin.tsx)]
- [x] **TypeScript page demo** (custom TypeScript code for more complex features, e.g. realtime camera streams processing with AI models) [[source](./server/app/pages/demo-typescript-page.tsx)]

### Core Functionality

- [x] Pre-rendered Page [[source](./server/app/pages/home.tsx) | [demo](https://liveviews.cc/)]
- [x] Form and Sanitizing user-generated content (prevent XSS attack by default) [[source](./server/app/pages/demo-form.tsx) | [demo](https://liveviews.cc/form)]
- [x] SPA with url-based routing [source: [app.tsx](./server/app/app.tsx), [routes.tsx](./server/app/routes.tsx), [menu.tsx](./server/app/menu.tsx) | [demo](https://liveviews.cc/)]

### Real-time Features

- [x] Thermostat [[source](./server/app/pages/thermostat.tsx) | [demo](https://liveviews.cc/thermostat)]
- [x] Image Editor [[source](./server/app/pages/editor.tsx) | [demo](https://liveviews.cc/editor)]
- [x] Autocomplete Searching [[source](./server/app/pages/auto-complete-demo.tsx) | [demo](https://liveviews.cc/auto-complete)]
- [x] Chatroom with locales and timezone support [source: [chatroom.tsx](./server/app/pages/chatroom.tsx) | [demo](https://liveviews.cc/chatroom)]
- [x] Chatroom with database and realtime update [[source](https://github.com/beenotung/live-chat)]

### Data Handling

- [x] Image compression and file uploading [[source](./server/app/pages/demo-upload.tsx)] | [[demo](https://liveviews.cc/upload)]
- [x] User Agents statistics from sqlite3 database [[source](./server/app/pages/user-agents.tsx) | [demo](https://liveviews.cc/user-agents)]

### Complete Applications

- [x] Realtime Collaborative Painting [[source](https://github.com/beenotung/live-paint) | [demo](https://paint.liveviews.cc)]
- [x] Hacker News Clone [[source](https://github.com/beenotung/liveview-hn) | [demo](https://hn.liveviews.cc)]
- [x] Multi-Player Apple Chess Board Game [[source](https://github.com/beenotung/live-chess) | [demo](https://chess.liveviews.cc/)]

Examples to be done:

- [ ] Snake game
- [ ] Blog with headline image
- [ ] Landing page with contact form
- [ ] Survey form
- [ ] Content marketing with lead magnet

Docs to review:

- [ ] Review docs/developer-guide.md and docs/examples/ (AI-generated, not fully reviewed)

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
