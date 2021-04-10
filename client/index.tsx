import type { VElement } from './dom.js'
import { mountElement, updateElement } from './dom.js'
import JSX from './jsx.js'
import { connectWS } from './ws-reliable.js'

let wsUrl = location.origin.replace('http', 'ws')
connectWS<ServerMessage>({
  createWS(protocol) {
    let status = document.querySelector('#ws_status')
    if (status) {
      status.textContent = 'connecting ws...'
    }
    return new WebSocket(wsUrl, [protocol])
  },
  attachWS(ws) {
    console.log('attach ws')
    ;(window as any).emit = ws.send
    const status = document.querySelector('#ws_status')
    if (status) {
      ws.ws.addEventListener('open', () => {
        status.textContent = 'connected ws'
      })
      ws.ws.addEventListener('close', () => {
        status.textContent = 'disconnected ws'
      })
    }
  },
  onMessage(event) {
    console.log('on ws message:', event)
    onServerMessage(event)
  },
})

type ServerMessage = ['update', VElement]

function onServerMessage(message: ServerMessage) {
  let [type, value] = message as ServerMessage
  switch (type) {
    case 'update':
      updateElement(value)
      break
    default:
      console.log('message:', message)
  }
}

let app = document.querySelector('#app')!
let root: VElement = ['div#app.loading', [], [['h1', [], ['loading']]]]
root = (
  <div id="app" className="loading">
    <h1>loading</h1>
  </div>
) as any

if (!'local') {
  mountElement(app, root)
}
