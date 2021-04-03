import {
  DefaultReconnectInterval,
  HeartBeatTimeoutCode,
  HeartBeatTimeoutReason,
  HeartHeatInterval,
  HeartHeatTimeout,
  MaxReconnectInterval
} from './ws-config.js'

export const Ping = 1
export const Pong = 2
export const Send = 3
export const Received = 4
export const RequestResend = 5
export type MsgId = number
export type WsMessage<Event> =
  | typeof Ping
  | typeof Pong
  | [typeof Send, MsgId, Event]
  | [typeof Received, MsgId]
  | [typeof RequestResend, MsgId]
export const RawPing = JSON.stringify(Ping)
export const RawPong = JSON.stringify(Pong)

type Timer = ReturnType<typeof setTimeout>

export type ManagedWebsocket<ClientEvent = any> = {
  ws: WebSocket
  send(event: ClientEvent): void
  close(code?: number, reason?: string): void
}

let reconnectInterval = DefaultReconnectInterval

export function connectWS<ServerEvent = any, ClientEvent = any>(options: {
  createWS: (protocol: string) => WebSocket
  attachWS: (ws: ManagedWebsocket) => void
  onMessage: (data: ServerEvent) => void
}) {
  const ws = options.createWS('ws-reliable')

  let pingTimer: Timer
  let pongTimer: Timer
  heartbeat()

  function heartbeat() {
    clearTimeout(pingTimer)
    clearTimeout(pongTimer)
    pingTimer = setTimeout(sendPing, HeartHeatInterval)
    pongTimer = setTimeout(onHeartbeatTimeout, HeartHeatTimeout)
  }

  function sendPing() {
    if (ws.bufferedAmount === 0 && ws.readyState === ws.OPEN) {
      ws.send(RawPing)
    }
  }

  function onHeartbeatTimeout() {
    console.debug('onHeartbeatTimeout')
    ws.close(HeartBeatTimeoutCode, HeartBeatTimeoutReason)
  }

  ws.addEventListener('open', () => {
    reconnectInterval = DefaultReconnectInterval
    heartbeat()
  })

  ws.addEventListener('close', event => {
    teardown()
    // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (event.code === 1001) {
      // don't auto-reconnect when the browser is navigating away from the page
      return
    }
    console.debug('will reconnect ws after', (reconnectInterval / 1000).toFixed(1), 'seconds')
    setTimeout(() => connectWS(options), reconnectInterval)
    reconnectInterval = Math.min(reconnectInterval * 1.5, MaxReconnectInterval)
  })

  function teardown() {
    clearTimeout(pingTimer)
    clearTimeout(pongTimer)
  }

  function close(code?: number, reason?: string) {
    teardown()
    ws.close(code, reason)
  }

  let nextOutgoingMessageId = 0
  let outbox: string[] = []

  let nextIncomingMessageId = 0
  let inbox: ServerEvent[] = []

  function send(event: ClientEvent) {
    clearTimeout(pingTimer)
    let clientMessage: WsMessage<ClientEvent> = [
      Send,
      nextOutgoingMessageId,
      event
    ]
    let data = JSON.stringify(clientMessage)
    outbox[nextOutgoingMessageId] = data
    nextOutgoingMessageId++
    ws.send(data)
  }

  function onServerEvent(event: ServerEvent) {
    let ackMessage: WsMessage<ClientEvent> = [Received, nextIncomingMessageId]
    ws.send(JSON.stringify(ackMessage))
    options.onMessage(event)
  }

  ws.addEventListener('message', event => {
    heartbeat()
    let serverMessage: WsMessage<ServerEvent> = JSON.parse(String(event.data))
    if (serverMessage === Ping) {
      if (ws.bufferedAmount === 0) {
        ws.send(RawPong)
      }
      return
    }
    if (serverMessage === Pong) {
      return
    }
    if (serverMessage[0] === Send) {
      let incomingMessageId = serverMessage[1]
      let serverEvent = serverMessage[2]
      if (incomingMessageId === nextIncomingMessageId) {
        // incoming message arriving in order
        // 1. dispatch this newly received message
        onServerEvent(serverEvent)
        nextIncomingMessageId++
        // 2. dispatch previous buffered messages
        while (nextIncomingMessageId in inbox) {
          onServerEvent(inbox[nextIncomingMessageId])
          delete inbox[nextIncomingMessageId]
          nextIncomingMessageId++
        }
        return
      }
      // missed some incoming messages
      // 1. store into inbox buffer
      inbox[incomingMessageId] = serverEvent
      // 2. request the peer to resend the expected message by id
      let followupMessage: WsMessage<ClientEvent> = [
        RequestResend,
        nextIncomingMessageId
      ]
      ws.send(JSON.stringify(followupMessage))
      return
    }
    if (serverMessage[0] === Received) {
      let receivedMessageId = serverMessage[1]
      delete outbox[receivedMessageId]
      // TODO check for missed messages in-between
      return
    }
    if (serverMessage[0] === RequestResend) {
      let requestMessageId = serverMessage[1]
      if (requestMessageId in outbox) {
        ws.send(outbox[requestMessageId])
      } else {
        console.debug('request resend unknown ws message:', requestMessageId)
      }
      return
    }
    console.debug('received unknown ws message:', event)
  })

  options.attachWS({ ws, send, close })
}
