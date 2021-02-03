export function createWebsocketClient() {
  const url = location.href.replace('http', 'ws')
  const ws = new WebSocket(url)
  ws.addEventListener('open', ev => {
    console.log('open', ev)
  })
  ws.addEventListener('close', ev => {
    console.log('close', ev)
  })
  ws.addEventListener('message', ev => {
    console.log('message', ev)
  })
  ws.addEventListener('error', ev => {
    console.log('error', ev)
  })
  return ws
}
