console.log('ts')

import { createWebsocketClient } from './client'

const ws = createWebsocketClient()
Object.assign(window, { ws })
