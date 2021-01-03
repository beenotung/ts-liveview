import S from 's-js'
import { ISpark } from 'typestub-primus'
import {
  c,
  genPrimusScript,
  h,
  Request,
  Response,
  SLiveSession,
  startServer,
} from '../src'

function initialView(req: Request, res: Response) {
  return c(
    '#app',
    h`<div id="app" class="init">
  <p>
    Now is: ${new Date().toLocaleString()}
  </p>
  <label>Name:</label>
  <input onchange="send('name', event.target.value)">
  <br>
  <p>
    Hello, Guest
  </p>
</div>`,
  )
}

// this callback will be called from a S.root context
// the context will be cleanup automatically when the client connection is closed
function createSession(spark: ISpark): SLiveSession | void {
  const session = SLiveSession.spawnFromRoot(spark)
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
