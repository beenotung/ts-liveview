import type { VNode } from './dom.js'
import { mountElement, updateNode } from './dom.js'
import JSX from './jsx.js'
import { connectWS } from './ws.js'

let wsUrl = location.origin.replace('http', 'ws')
connectWS<ServerMessage>({
  createWS() {
    return new WebSocket(wsUrl)
  },
  attachWS(ws) {
    ;(window as any).emit = ws.send
  },
  onMessage(event) {
    console.log('on ws message:', event)
    onServerMessage(event)
  },
})

type ServerMessage = ['update', VNode]

function onServerMessage(message: ServerMessage) {
  let [type, value] = message as ServerMessage
  switch (type) {
    case 'update':
      updateNode(value)
      break
    default:
      console.log('message:', message)
  }
}

let app = document.querySelector('#app')!
let root: VNode = ['div#app.loading', [], [['h1', [], ['loading']]]]
root = (
  <div id="app" className="loading">
    <h1>loading</h1>
  </div>
) as any

if (!'local') {
  mountElement(app, root)
}
