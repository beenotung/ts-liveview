import { Server, ServerOptions } from 'ws'
import type WebSocket from 'ws'

interface ManagedWebSocket extends WebSocket {
  isAlive?: boolean
}

export function createWebSocketServer(options: {
  server: ServerOptions
  heartbeat: {
    interval: number
    timeout: number
  }
  onConnection: (ws: ManagedWebSocket) => void
}) {
  const wss = new Server(options.server)

  const timer = setInterval(() => {
    wss.clients.forEach((ws: ManagedWebSocket) => {
      if (ws.isAlive === false) {
        ws.terminate()
        return
      }
      ws.isAlive = false
      ws.ping()
    })
  }, options.heartbeat.interval)
  wss.on('close', () => {
    clearInterval(timer)
  })

  wss.on('connection', (ws: ManagedWebSocket) => {
    ws.isAlive = true
    ws.on('pong', () => {
      ws.isAlive = true
    })
    options.onConnection(ws)
    ws.onopen = event => {
      console.log('open', event)
    }
  })

  return wss
}
