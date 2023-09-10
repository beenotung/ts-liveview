import type { Server } from 'ws'
import type { ServerMessage } from '../../client/types'
import { debugLog } from '../debug.js'
import type { ManagedWebsocket, OnWsMessage } from './wss'
import { Request } from 'express'

let log = debugLog('wss-native.ts')
log.enabled = true

export function listenWSSConnection(options: {
  wss: Server
  onConnection: (ws: ManagedWebsocket) => void
  onClose: (ws: ManagedWebsocket, code?: number, reason?: Buffer) => void
  onMessage: OnWsMessage
}) {
  const { wss } = options
  wss.on('connection', (ws, request) => {
    if (ws.protocol !== 'ws-native') {
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
      let data = JSON.stringify(event)
      ws.send(data)
    }

    ws.on('message', data => {
      let event = JSON.parse(String(data))
      options.onMessage(event, managedWS, wss)
    })

    const managedWS: ManagedWebsocket = {
      ws,
      wss,
      request: request as Request,
      send,
      close,
    }
    options.onConnection(managedWS)
  })
}
