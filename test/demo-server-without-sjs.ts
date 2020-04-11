import { c, h, Session, startServer, useClientMessage } from '../src'

type State = {
  name: string
  clock: number
}

function initialState(): State {
  return {
    name: '',
    clock: Date.now(),
  }
}

function render(state: State = initialState()) {
  return c(
    '#app',
    h`<div id="app">
  <p>
    Now is: ${new Date(state.clock).toLocaleString()}
  </p>
  <label>Name:</label>
  <input onchange="send('name', event.target.value)">
  <br>
  <p>
    Hello, ${state.name || 'Guest'}
  </p>
</div>`,
  )
}

function createSession(session: Session): Session | void {
  const state = initialState()

  function update() {
    const template = render(state)
    session.sendTemplate(template)
  }

  setInterval(() => {
    state.clock = Date.now()
    update()
  }, 1000)

  session.onMessage = useClientMessage(message => {
    console.log(message)
    const [name, value] = message.args
    if (name !== 'name') {
      console.warn('unknown client message:', message)
      return
    }
    state.name = value
    update()
  })

  return session
}

const port = 3000

startServer({
  port,
  createSession,
  initialRender: (req, res) => {
    return render()
  },
})
