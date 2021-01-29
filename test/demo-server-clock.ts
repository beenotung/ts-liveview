import { ISpark } from 'typestub-primus'
import { c, h } from '../src/h'
import { wrapMobileHTML } from '../src/helpers/mobile-html'
import { toHTML } from '../src/helpers/render'
import { LiveSession } from '../src/live-session'
import { startServer } from '../src/server'

function render(state: number) {
  return c(
    '#clock',
    h`<div id='clock'>${new Date(state).toLocaleString()}</div>`,
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
  createSession,
  handler: (req, res) => {
    const component = render(Date.now())
    const body = toHTML(component)
    const html = wrapMobileHTML(body, {
      heads: [`<script src='/primus/primus.js'></script>`],
    })
    res.send(html)
  },
})
