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
export const Send = '3'

type Timer = ReturnType<typeof setTimeout>

let reconnectInterval = DefaultReconnectInterval

export function connectWS<ServerEvent = any, ClientEvent = any>(options: {
  createWS: (protocol: string) => WebSocket
  attachWS: (ws: ManagedWebsocket) => void
  onMessage: (data: ServerEvent) => void
}) {
  const ws = options.createWS('ws-lite')

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
      ws.send(Ping)
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
    console.debug(
      'will reconnect ws after',
      (reconnectInterval / 1000).toFixed(1),
      'seconds',
    )
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

  function send(event: ClientEvent) {
    clearTimeout(pingTimer)
    let data = Send + JSON.stringify(event)
    ws.send(data)
  }

  ws.addEventListener('message', event => {
    heartbeat()
    let data = String(event.data)
    if (data === Ping) {
      if (ws.bufferedAmount === 0) {
        ws.send(Pong)
      }
      return
    }
    if (data === Pong) {
      return
    }
    if (data[0] === Send) {
      options.onMessage(JSON.parse(data.slice(1)))
      return
    }
    console.debug('received unknown ws message:', event)
  })

  options.attachWS({ ws, send, close })
}
