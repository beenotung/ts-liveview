import type { Server } from 'ws'
import { debugLog } from '../debug.js'
import type { ManagedWebsocket, OnWsMessage } from './wss'

let log = debugLog('wss-native.ts')
log.enabled = true

export function listenWSS<ClientEvent = any, ServerEvent = any>(options: {
  wss: Server
  onConnection: (ws: ManagedWebsocket) => void
  onClose: (ws: ManagedWebsocket, code?: number, reason?: string) => void
  onMessage: OnWsMessage
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
      let event = JSON.parse(String(data))
      options.onMessage(event, managedWS, wss)
    })

    const managedWS: ManagedWebsocket = { ws, send, close }
    options.onConnection(managedWS)
  })
}
