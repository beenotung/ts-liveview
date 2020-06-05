# TS LiveView

[![npm Package Version](https://img.shields.io/npm/v/ts-liveview.svg?maxAge=3600)](https://www.npmjs.com/package/ts-liveview)

LiveView enables rich, real-time user experiences with server-rendered HTML.

Just like [Phoenix LiveView](https://github.com/phoenixframework/phoenix_live_view) but in Typescript!

#### Examples

SPA with url routing:
[Demo](https://liveviews.xyz),
[Source](./examples/spa-demo)

Realtime chatroom:
[Demo](https://chat.liveviews.xyz),
[Source](./examples/chatroom-demo)

## Why server-rendered?
- To make the PWA deliver initial meaningful paint as soon as possible
- To avoid over bloating the amount of javascript the client need to download and execute
- To allow 'over-the-air' update of application deployment

## Features
- [x] Return complete layout on initial GET request (in a single pass)
- [x] Progressive enhancement for interactivity
- [x] Realtime Server side 'rendering' for incremental update
- [x] Bidirectional event push
- [x] Auto reconnect websocket
- [x] Attachable on custom express and primus instance

## Size Comparison
| Tools | Runtime Code Size (minified) |
|---|---|
| **TS LiveView v0 + morphdom** | **8K** |
| (Phoenix) LiveView.js + morphdom | 29K |
| TS LiveView v1 + morphdom + primus.js | 46K |
| Vue 2.5.20 | 88K |
| React 16.6.3 + React DOM | 112K |
| Ember 3.0.0.beta.2 | 468K |
| React + Ionic * | 2.1M |
| Stencil + Ionic * | 3.0M |
| Angular + Ionic * | 4.2M |

*: all Ionic build excluded the svg, assets, *.map and PWA json files

Not only is LiveView + morphdom much lighter than the JS frameworks, the frameworks are just the baseline. You still need to ship application-specific JS and often add supporting JS libraries such as react-router, redux and friends to get feature parity. Those can easily boom the code size for runtime to be over 10MB, causing the latency of the first meaningful paint to be over 25 seconds on mobile device.

reference: https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript

## The Gist (Example in Code)
### Simple Clock
```typescript
import { c, h, Session, startServer } from '../src'

function render(state: number) {
  return c(
    '#clock',
    h`<div id="clock">${new Date(state).toLocaleString()}</div>`,
  )
}

function createSession(session: Session): Session | void {
  let state = Date.now()

  function update() {
    const view = render(state)
    session.sendComponent(view)
  }

  const timer = setInterval(() => {
    state = Date.now()
    update()
  }, 1000)

  session.onClose(() => clearInterval(timer))

  return session
}

startServer({
  port: 3000,
  heads: [
    // default path for websocket lib
    `<script src="/primus/primus.js"></script>`,
  ],
  createSession,
  initialRender: (req, res) => {
    return render(Date.now())
  },
})
```

### Using s-js to trigger updates
```typescript
import S from 's-js'
import { c, genPrimusScript, h, Request, Response, Session, startServer, } from '../src'

function initialView(req: Request, res: Response) {
  return c('#app', h`<div id="app" class="init">
  <p>
    Now is: ${new Date().toLocaleString()}
  </p>
  <label>Name:</label>
  <input onchange="send('name', event.target.value)">
  <br>
  <p>
    Hello, Guest
  </p>
</div>`)
}

// this callback will be called from a S.root context
// the context will be cleanup automatically when the client connection is closed
function createSession(session: Session): Session | void {
  const clock = S.data(Date.now())
  const timer = setInterval(() => clock(Date.now()), 1000)
  S.cleanup(() => clearInterval(timer))
  setInterval(() => clock(Date.now()), 1000)

  function renderClock() {
    return c(
      '#clock',
      h`<p id="clock">Now is: ${new Date(clock()).toLocaleString()}</p>`,
    )
  }

  const name = S.data('')

  function renderName() {
    return c(
      '#name',
      h`<div id="name">
<label>Name: </label>
<input onchange="send('name', event.target.value)">
<p>
Hello, ${name() || 'Guest'}
</p>
</div>`,
    )
  }

  function renderRoot() {
    return S.sample(() =>
      c(
        '#app',
        h`<div id="app" class="live">
${renderClock()}
${renderName()}
</div>`,
      ),
    )
  }

  session.sendComponent(renderRoot())
  session.live(renderClock, { skipInitialSend: true })
  session.live(renderName, { skipInitialSend: true })

  session.onMessage(message => {
    const [k, v] = message
    if (k !== 'name') {
      console.warn('unknown client message:', message)
      return
    }
    name(v)
  })

  return session
}

startServer({
  port: 3000,
  heads: [genPrimusScript()],
  createSession,
  initialRender: (req, res) => {
    return initialView(req, res)
  },
})
```

### More examples
- [Single-file demo with s-js](./test/demo-server-with-sjs.ts)
- [Single-file demo without s-js](./test/demo-server-without-sjs.ts)
- [SSR SPA Example](./examples/spa-demo) (server-rendered single-page webapp)

## Todo
- [x] Auto reconnect the websocket*
- [x] Recover session when reconnect*
- [ ] make session simpler and put s-js component into core?
- [ ] update spa example, tests, and readme to adopt the breaking change
- [ ] abstract primus to allow custom transport and encoding
- [ ] use history.pushState in demo instead of location hash, for easier sharing and initial rendering
- [ ] support preventing XSS issue**

*: Solved by [Primus](https://github.com/primus/primus)

**: maybe use JSX/TSX?
If so, will be hard to detect changes.
Or just provide helper functions and require the developer to explicitly escape it?

## LICENSE
[BSD-2-Clause LICENSE](./LICENSE)
(Free Open Source Software)
