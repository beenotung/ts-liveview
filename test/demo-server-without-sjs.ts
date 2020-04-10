import { h } from '../src/h'
import { useClientMessage } from '../src/helpers/server'
import { startServer } from '../src/server'
import { Session } from '../src/session'

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

const selector = '#app'

function render(state: State = initialState()) {
  return h`<div id="app">
  <p>
    Now is: ${new Date(state.clock).toLocaleString()}
  </p>
  <label>Name:</label>
  <input onchange="send('name', event.target.value)">
  <br>
  <p>
    Hello, ${state.name || 'Guest'}
  </p>
</div>`
}

function createSession(session: Session): Session | void {
  const state = initialState()

  function update() {
    session.sendMessage({
      type: 'repaint',
      selector,
      template: render(state),
    })
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
