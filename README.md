# TS LiveView

LiveView enables rich, real-time user experiences with server-rendered HTML.

Just like [Phoenix LiveView](https://github.com/phoenixframework/phoenix_live_view) but in Typescript!

[![npm Package Version](https://img.shields.io/npm/v/ts-liveview.svg?maxAge=2592000)](https://www.npmjs.com/package/ts-liveview)

## Why server-rendered?
- To make the PWA deliver initial meaningful paint as soon as possible
- To avoid over bloating the amount of javascript the client need to download
- To allow 'over-the-air' update of application deployment

## Features
- [x] Return rich layout on initial GET request in one-pass
- [x] Progressive enhancement for interactivity
- [x] Realtime Server side 'rendering' for incremental update
- [x] Bidirectional event push

## Example
### Simple Clock
```typescript
import { startServer, Session, c, h } from './dist'

function render(state: number){
  return c(
    '#clock',
    h`<div id="clock">${new Date(state)}</div>`,
  )
}

function createSession(session: Session): Session | void {
  let state = Date.now()

  function update() {
    const template = render(state)
    session.sendTemplate(template)
  }

  let timer = setInterval(()=>{
    state = Date.now()
    update()
  }, 1000)
  session.once('close', () => clearInterval(timer))

  return session
}

startServer({
  port: 3000,
  createSession,
  initialRender: (req, res) => {
    return render(Date.now())
  },
})
```

### Using s-js to trigger updates
```typescript
import { sampleTemplate, startServer, Session, useClientMessage, c, h } from './dist'
import S from 's-js'

function initialView(req: Request, res: Response) {
  return h`<div id="app" class="init">
  <p>
    Now is: ${new Date().toLocaleString()}
  </p>
  <label>Name:</label>
  <input onchange="send('name', event.target.value)">
  <br>
  <p>
    Hello, Guest
  </p>
</div>`
}

function createSession(session: Session): Session | void {
  S.root(dispose => {
    session.once('close', dispose)

    const clock = S.data(Date.now())
    let timer = setInterval(() => clock(Date.now()), 1000)
    S.cleanup(() => clearInterval(timer))
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
      return c(
        '#app',
        h`<div id="app" class="live">
${sampleTemplate(renderClock)}
${sampleTemplate(renderName)}
</div>`,
      )
    }

     session.sendTemplate(renderRoot())
     session.live(renderClock, { skipInitialSend: true })
     session.live(renderName, { skipInitialSend: true })

    session.onMessage = useClientMessage(message => {
      const [k, v] = message.args
      if (k !== 'name') {
        console.warn('unknown client message:', message)
        return
      }
      name(v)
    })
  })

  return session
}

startServer({
  port: 3000,
  createSession,
  initialRender: (req, res) => {
    return initialView(req, res)
  },
})
```

### More examples
- [Single-file demo with s-js](./test/demo-server-with-sjs.ts)
- [Single-file demo without s-js](./test/demo-server-without-sjs.ts)
- [SSR SPA Example](./app) (server-rendered single-page webapp)

## Todo
- [x] Auto reconnect the websocket
- [ ] Recover session when reconnect*

*: maybe [Primus](https://github.com/primus/primus) can helps

## LICENSE
[BSD-2-Clause LICENSE](./LICENSE)
(Free Open Source Software)
