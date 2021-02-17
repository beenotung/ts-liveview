console.log('ts')

import { createWebsocketClient } from './client'

const socket = createWebsocketClient({
  initWS: ws => {
    Object.assign(window, { ws })
    ws.addEventListener('open', () => console.log('open'))
    ws.addEventListener('close', () => console.log('close'))
  },
})
Object.assign(window, { socket, send })
function send(...args: any[]) {
  socket.send(JSON.stringify(args))
}
