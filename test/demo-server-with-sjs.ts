import S from 's-js'
import {
  c,
  h,
  Request,
  Response,
  sampleTemplate,
  Session,
  startServer,
  useClientMessage,
} from '../src'

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

const port = 3000

startServer({
  port,
  createSession,
  initialRender: (req, res) => {
    return initialView(req, res)
  },
})
