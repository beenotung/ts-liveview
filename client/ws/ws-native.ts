import type { ManagedWebsocket } from './ws'

const defaultReconnectInterval = 250
const maxReconnectInterval = 10 * 1000
let reconnectInterval = defaultReconnectInterval

export function connectWS<ServerEvent = any, ClientEvent = any>(options: {
  createWS: (protocol: string) => WebSocket
  attachWS: (ws: ManagedWebsocket) => void
  onMessage: (data: ServerEvent) => void
}) {
  const ws = options.createWS('ws-native')

  ws.addEventListener('open', () => {
    reconnectInterval = defaultReconnectInterval
  })

  ws.addEventListener('close', event => {
    // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (event.code === 1001) {
      // don't auto-reconnect when the browser is navigating away from the page
      return
    }
    setTimeout(() => connectWS(options), reconnectInterval)
    reconnectInterval = Math.max(reconnectInterval * 1.5, maxReconnectInterval)
  })

  function close(code?: number, reason?: string) {
    ws.close(code, reason)
  }

  function send(event: ClientEvent) {
    let data = JSON.stringify(event)
    ws.send(data)
  }

  ws.addEventListener('message', event => {
    let data = JSON.parse(String(event.data))
    options.onMessage(data)
  })

  options.attachWS({ ws, send, close })
}
