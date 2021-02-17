console.log('ts')

import { createWebsocketClient } from './client'

const socket = createWebsocketClient({
  initWS: ws => {
    Object.assign(window, { ws })
    ws.on('open', () => console.log('open'))
  },
})
Object.assign(window, { socket })
