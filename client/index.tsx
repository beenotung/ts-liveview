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

    let emit = function emit() {
      ws.send(Array.from(arguments))
      if (window.event) {
        console.debug('preventDefault')
        window.event.preventDefault()
      }
    } as (...args: any[]) => void
    function emitHref(a: HTMLAnchorElement) {
      emit(a.getAttribute('href'))
    }
    let win = window as any
    win.emit = emit
    win.emitHref = emitHref

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

export type ServerMessage = ['update', VElement]

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
