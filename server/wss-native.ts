import type WebSocket from 'ws'
import type { Server } from 'ws'
import debug from 'debug'

let log = debug('wss-native.ts')
log.enabled = true

export type ManagedWebsocket<ServerEvent = any> = {
  ws: WebSocket
  send(event: ServerEvent): void
  close(code?: number, reason?: string): void
}

export function listenWSS<ClientEvent = any, ServerEvent = any>(options: {
  wss: Server
  attachWS: (ws: ManagedWebsocket) => void
  onClose: (ws: ManagedWebsocket, code?: number, reason?: string) => void
  onMessage: (ws: ManagedWebsocket, event: ClientEvent) => void
}) {
  const { wss } = options
  wss.on('connection', ws => {
    if (ws.protocol !== 'ws-native') {
      log('unknown ws protocol:', ws.protocol)
      return
    }
    ws.on('close', (code, reason) => {
      options.onClose(managedWS, code, reason)
    })

    function close(code?: number, reason?: string) {
      ws.close(code, reason)
    }

    function send(event: ServerEvent) {
      let data = JSON.stringify(event)
      ws.send(data)
    }

    ws.on('message', data => {
      options.onMessage(managedWS, JSON.parse(String(data)))
    })

    const managedWS: ManagedWebsocket = { ws, send, close }
    options.attachWS(managedWS)
  })
}
