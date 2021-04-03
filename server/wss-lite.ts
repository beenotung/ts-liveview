import type WebSocket from 'ws'
import type { Server } from 'ws'
import debug from 'debug'
import { Ping, Pong, Send } from '../client/ws-lite.js'

let log = debug('wss-lite.ts')
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
    if (ws.protocol !== 'ws-lite') {
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
      let data = Send + JSON.stringify(event)
      ws.send(data)
    }

    ws.on('message', data => {
      let message = String(data)
      if (message === Ping) {
        if (ws.bufferedAmount === 0) {
          ws.send(Pong)
        }
        return
      }
      if (message === Pong) {
        return
      }
      if (message[0] === Send) {
        options.onMessage(managedWS, JSON.parse(message.slice(1)))
        return
      }
      log('received unknown ws message:', data)
    })

    const managedWS: ManagedWebsocket = { ws, send, close }
    options.attachWS(managedWS)
  })
}
