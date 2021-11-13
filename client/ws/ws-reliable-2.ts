import type { ManagedWebsocket } from './ws'
import {
  DefaultReconnectInterval,
  HeartBeatTimeoutCode,
  HeartBeatTimeoutReason,
  HeartHeatInterval,
  HeartHeatTimeout,
  MaxReconnectInterval,
} from './ws-config.js'

export const Ping = '1'
export const Pong = '2'
export const Send = 3
export const Received = 4
export type WsMessage =
  | 1
  | 2
  | [send_code: 3, id: number, event: any]
  | [ack_code: 4, received_message_id: number, resend_message_id?: number]

type Timer = ReturnType<typeof setTimeout>

let reconnectInterval = DefaultReconnectInterval

export function connectWS<ServerEvent = any, ClientEvent = any>(options: {
  createWS: (protocol: string) => WebSocket
  attachWS: (ws: ManagedWebsocket) => void
  onMessage: (data: ServerEvent) => void
}) {
  function startWS() {
    return options.createWS('ws-reliable-2')
  }
  let ws = startWS()

  let pingTimer: Timer
  let pongTimer: Timer
  heartbeat()

  function heartbeat() {
    clearTimeout(pingTimer)
    clearTimeout(pongTimer)
    pingTimer = setTimeout(sendPing, HeartHeatInterval)
    pongTimer = setTimeout(onHeartbeatTimeout, HeartHeatTimeout)
  }

  function cancelHeartbeat() {
    clearTimeout(pingTimer)
    clearTimeout(pongTimer)
  }

  function sendRawData(data: string) {
    if (ws.bufferedAmount === 0 && ws.readyState === ws.OPEN) {
      ws.send(data)
    }
  }

  function sendPing() {
    sendRawData(Ping)
  }

  function onHeartbeatTimeout() {
    console.debug('onHeartbeatTimeout')
    ws.close(HeartBeatTimeoutCode, HeartBeatTimeoutReason)
  }

  function close(code?: number, reason?: string) {
    cancelHeartbeat()
    ws.close(code, reason)
  }

  let nextOutgoingMessageId = 1
  let outbox: string[] = []

  let nextIncomingMessageId = 1
  let inbox: ServerEvent[] = []

  function send(event: ClientEvent) {
    let clientMessage: WsMessage = [Send, nextOutgoingMessageId, event]
    let data = JSON.stringify(clientMessage)
    outbox[nextOutgoingMessageId] = data
    nextOutgoingMessageId++
    sendRawData(data)
    clearTimeout(pingTimer)
  }

  function onServerEvent(event: ServerEvent) {
    let ackMessage: WsMessage = [Received, nextIncomingMessageId]
    let data = JSON.stringify(ackMessage)
    sendRawData(data)
    options.onMessage(event)
  }

  function attachWS() {
    ws.addEventListener('open', () => {
      reconnectInterval = DefaultReconnectInterval
      heartbeat()
    })

    ws.addEventListener('close', event => {
      cancelHeartbeat()
      // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      if (event.code === 1001) {
        // don't auto-reconnect when the browser is navigating away from the page
        return
      }
      console.debug(
        'will reconnect ws after',
        (reconnectInterval / 1000).toFixed(1),
        'seconds',
      )
      setTimeout(() => {
        ws = startWS()
        attachWS()
      }, reconnectInterval)
      // randomFactor range from 0.9 to 1.1
      let randomFactor = 1 + (Math.random() * 2 - 1) * 0.1
      reconnectInterval *= 1.5 * randomFactor
      reconnectInterval = Math.min(reconnectInterval, MaxReconnectInterval)
    })

    ws.addEventListener('message', event => {
      heartbeat()
      let data = String(event.data)
      if (data === Ping) {
        sendRawData(Pong)
        return
      }
      if (data === Pong) {
        return
      }
      let serverMessage: Exclude<WsMessage, 1 | 2> = JSON.parse(data)
      if (serverMessage[0] === Send) {
        let incomingMessageId = serverMessage[1]
        let serverEvent = serverMessage[2]
        let ackMessage: WsMessage
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
          ackMessage = [Received, incomingMessageId]
        } else {
          // missed some incoming messages
          // 1. store into inbox buffer
          inbox[incomingMessageId] = serverEvent
          // 2. request the peer to resend the expected message by id
          ackMessage = [Received, incomingMessageId, nextIncomingMessageId]
        }
        sendRawData(JSON.stringify(ackMessage))
        return
      }
      if (serverMessage[0] === Received) {
        let receivedMessageId = serverMessage[1]
        let resendMessageId = serverMessage[2]
        delete outbox[receivedMessageId]
        if (!resendMessageId) return
        if (resendMessageId in outbox) {
          sendRawData(outbox[resendMessageId])
        } else {
          console.debug(
            'request to resend unknown outbox message. id:',
            resendMessageId,
            'outbox length:',
            outbox.length,
          )
        }
        return
      }
      console.debug('received unknown ws message:', serverMessage)
    })
    options.attachWS({ ws, send, close })
  }

  attachWS()
}
