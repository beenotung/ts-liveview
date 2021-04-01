import type { VNode } from './dom.js'
import { mountElement, updateNode } from './dom.js'
import JSX from './jsx.js'
import { connectWS } from './ws.js'

let win = (typeof window === 'undefined' ? global : window) as any

let wsUrl = location.origin.replace('http', 'ws')
let ws: WebSocket
connectWS({
  createWS() {
    return (ws = new WebSocket(wsUrl))
  },
  onMessage(event) {
    console.log('ws message:', event.data)
    let message = JSON.parse(String(event.data))
    onServerMessage(message)
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

function emit(data: any) {
  // TODO queue if not ready
  ws.send(JSON.stringify(data))
}

win.emit = emit

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
