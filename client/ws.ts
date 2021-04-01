const defaultReconnectInterval = 250
const maxReconnectInterval = 250
let reconnectInterval = defaultReconnectInterval

export const heartHeatInterval = 30 * 1000
export const heartHeatTimeout = 45 * 1000

export function connectWS(options: {
  createWS: () => WebSocket
  onMessage:(event:MessageEvent)=>void
}) {
  const ws = options.createWS()
  let heartBeatTimer: ReturnType<typeof setTimeout>
  let pingMessage = new Blob([])
  function heartbeat() {
    clearTimeout(heartBeatTimer)
    heartBeatTimer = setTimeout(onHeartbeatTimeout, heartHeatTimeout)
    if (ws.readyState === ws.OPEN) {
      ws.send(pingMessage)
    }
  }
  heartbeat()
  function onHeartbeatTimeout() {
    console.debug('onHeartbeatTimeout')
    // ws.close(1013, 'heartbeat timeout')
    ws.close(4013, 'heartbeat timeout')
  }
  ws.addEventListener('open', () => {
    reconnectInterval = defaultReconnectInterval
    heartbeat()
  })
  ws.addEventListener('message', event => {
    heartbeat()
    // skip pong message
    if(!(event.data instanceof Blob && event.data.size ===0)){
      options.onMessage(event)
    }
  })
  ws.addEventListener('close', event => {
    // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (event.code === 1001) return
    setTimeout(() => connectWS(options), reconnectInterval)
    reconnectInterval = Math.max(reconnectInterval * 1.5, maxReconnectInterval)
  })
}
