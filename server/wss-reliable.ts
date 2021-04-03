import type { Server } from 'ws'
import type WebSocket from 'ws'
import debug from 'debug'
import { Ping, Pong, RawPong, Received, RequestResend, Send, WsMessage } from '../client/ws-reliable.js'

let log = debug('wss-reliable.ts')
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
    if (ws.protocol !== 'ws-reliable') {
      log('unknown ws protocol:', ws.protocol)
      return
    }
    ws.on('close', (code, reason) => {
      options.onClose(managedWS, code, reason)
    })

    function close(code?: number, reason?: string) {
      ws.close(code, reason)
    }

    let nextOutgoingMessageId = 0
    let outbox: string[] = []

    let nextIncomingMessageId = 0
    let inbox: ClientEvent[] = []

    function send(event: ServerEvent) {
      let serverMessage: WsMessage<ServerEvent> = [Send, nextOutgoingMessageId, event]
      let data = JSON.stringify(serverMessage)
      outbox[nextOutgoingMessageId] = data
      nextOutgoingMessageId++
      ws.send(data)
    }

    function onClientEvent(event: ClientEvent) {
      let ackMessage: WsMessage<ServerEvent> = [Received, nextIncomingMessageId]
      ws.send(JSON.stringify(ackMessage))
      options.onMessage(managedWS, event)
    }

    ws.on('message', data => {
      let clientMessage: WsMessage<ClientEvent> = JSON.parse(String(data))
      if (clientMessage === Ping) {
        if (ws.bufferedAmount === 0) {
          ws.send(RawPong)
        }
        return
      }
      if (clientMessage === Pong) {
        return
      }
      if (clientMessage[0] === Send) {
        let incomingMessageId = clientMessage[1]
        let clientEvent = clientMessage[2]
        if (incomingMessageId === nextIncomingMessageId) {
          // incoming message arriving in order
          // 1. dispatch this newly received message
          onClientEvent(clientEvent)
          nextIncomingMessageId++
          // 2. dispatch previous buffered messages
          while (nextIncomingMessageId in inbox) {
            onClientEvent(inbox[nextIncomingMessageId])
            delete inbox[nextIncomingMessageId]
            nextIncomingMessageId++
          }
          return
        }
        // missed some incoming messages
        // 1. store into inbox buffer
        inbox[incomingMessageId] = clientEvent
        // 2. request the peer to resend the expected message by id
        let followupMessage: WsMessage<ServerEvent> = [RequestResend, nextIncomingMessageId]
        ws.send(JSON.stringify(followupMessage))
        return
      }
      if (clientMessage[0] === Received) {
        let receivedMessageId = clientMessage[1]
        delete outbox[receivedMessageId]
        // TODO check for missed messages in-between
        return
      }
      if (clientMessage[0] === RequestResend) {
        let requestMessageId = clientMessage[1]
        if (requestMessageId in outbox) {
          ws.send(outbox[requestMessageId])
        } else {
          log('request resend unknown ws message:', requestMessageId)
        }
        return
      }
      log('received unknown ws message:', data)
    })

    const managedWS: ManagedWebsocket = { ws, send, close }
    options.attachWS(managedWS)
  })
}
