import { ISpark } from 'typestub-primus'
import { c, h, LiveSession, startServer } from '../src'

function render(state: number) {
  return c(
    '#clock',
    h`<div id="clock">${new Date(state).toLocaleString()}</div>`,
  )
}

function createSession(spark: ISpark): LiveSession | void {
  const session = new LiveSession(spark)
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
