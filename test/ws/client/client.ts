export function createWebsocketClient() {
  const url = location.href.replace('http', 'ws')
  const ws = new WebSocket(url)
  console.log(ws)
  ws.addEventListener('open', () => {
    console.log('connected to server')
  })
  ws.addEventListener('close', () => {
    console.log('close')
  })
  ws.addEventListener('error', ev => {
    console.log('error', ev)
  })
  ws.addEventListener('message', ev => {
    console.log('message', ev)
  })
  return ws
}
