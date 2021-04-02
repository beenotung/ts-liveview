const defaultReconnectInterval = 250
const maxReconnectInterval = 10 * 1000
let reconnectInterval = defaultReconnectInterval

export const heartHeatInterval = 30 * 1000
export const heartHeatTimeout = 45 * 1000

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

type ManagedWebsocket<ClientEvent = any> = {
  ws: WebSocket
  send(event: ClientEvent): void
  close(code?: number, reason?: string): void
}

export function connectWS<ServerEvent = any, ClientEvent = any>(options: {
  createWS: () => WebSocket
  attachWS: (ws: ManagedWebsocket) => void
  onMessage: (data: ServerEvent) => void
}) {
  const ws = options.createWS()

  let pingTimer: Timer
  let pongTimer: Timer
  heartbeat()

  function heartbeat() {
    clearTimeout(pingTimer)
    clearTimeout(pongTimer)
    pingTimer = setTimeout(sendPing, heartHeatInterval)
    pongTimer = setTimeout(onHeartbeatTimeout, heartHeatTimeout)
  }

  function sendPing() {
    if (ws.bufferedAmount === 0 && ws.readyState === ws.OPEN) {
      ws.send(RawPing)
    }
  }

  function onHeartbeatTimeout() {
    console.debug('onHeartbeatTimeout')
    // ws.close(1013, 'heartbeat timeout')
    ws.close(4013, 'heartbeat timeout')
  }

  ws.addEventListener('open', () => {
    reconnectInterval = defaultReconnectInterval
    heartbeat()
  })
  ws.addEventListener('close', event => {
    // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (event.code === 1001) {
      // don't auto-reconnect when the browser is navigating away from the page
      return
    }
    teardown()
    setTimeout(() => connectWS(options), reconnectInterval)
    reconnectInterval = Math.max(reconnectInterval * 1.5, maxReconnectInterval)
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
      event,
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
    console.log('received ws message:', event)
    heartbeat()
    let serverMessage: WsMessage<ServerEvent> = JSON.parse(String(event.data))
    if (serverMessage === Ping) {
      ws.send(RawPong)
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
        nextIncomingMessageId,
      ]
      ws.send(JSON.stringify(followupMessage))
      return
    }
    if (serverMessage[0] === Received) {
      let receivedMessageId = serverMessage[1]
      delete outbox[receivedMessageId]
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
    console.debug('received unknown ws message:', serverMessage)
  })

  options.attachWS({ ws, send, close })
}
