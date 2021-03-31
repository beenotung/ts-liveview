let defaultReconnectInterval = 250
let reconnectInterval = defaultReconnectInterval

export function connectWS(options: {
  createWS: () => WebSocket
  initWS: (ws: WebSocket) => void
}) {
  let ws = options.createWS()
  ws.addEventListener('open', () => {
    reconnectInterval = defaultReconnectInterval
  })
  ws.addEventListener('close', event => {
    // reference: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    if (event.code === 1001) return
    setTimeout(() => connectWS(options), reconnectInterval)
    reconnectInterval *= 1.5
  })
  options.initWS(ws)
  return ws
}
