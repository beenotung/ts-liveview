import S from 's-js'
import { h } from '../src/h'
import { useClientMessage } from '../src/helpers/server'
import { startServer } from '../src/server'
import { Session } from '../src/session'
import { Request, Response } from '../src/types'

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
  S.root(() => {
    const clock = S.data(Date.now())
    setInterval(() => clock(Date.now()), 1000)

    const clockView = session.S(
      '#clock',
      () => h`<p id="clock">Now is : ${new Date(clock()).toLocaleString()}</p>`,
    )

    const name = S.data('')
    const nameView = session.S(
      '#name',
      () =>
        h`<div id="name">
<label>Name: </label>
<input onchange="send('name', event.target.value)">
<p>
Hello, ${name() || 'Guest'}
</p>
</div>`,
    )

    const rootView = session.S(
      '#app',
      () =>
        h`<div id="app" class="live">
${clockView.sampleHTML()}
${nameView.sampleHTML()}
</div>`,
    )

    rootView()

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
