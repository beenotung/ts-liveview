import type { Server } from 'typestub-ws'
import { Ping, Pong, Send } from '../../client/ws/ws-lite.js'
import { debugLog } from '../debug.js'
import type { ManagedWebsocket, OnWsMessage } from './wss'
import type { ServerMessage } from '../../client/types'

let log = debugLog('wss-lite.ts')
log.enabled = true

export function listenWSSConnection(options: {
  wss: Server
  onConnection: (ws: ManagedWebsocket) => void
  onClose: (ws: ManagedWebsocket, code?: number, reason?: Buffer) => void
  onMessage: OnWsMessage
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

    function close(code?: number, reason?: Buffer) {
      ws.close(code, reason)
    }

    function send(event: ServerMessage) {
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
        let event = JSON.parse(message.slice(1))
        options.onMessage(event, managedWS, wss)
        return
      }
      log('received unknown ws message:', data)
    })

    const managedWS: ManagedWebsocket = { ws, wss, send, close }
    options.onConnection(managedWS)
  })
}
