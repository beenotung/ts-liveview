import type http from 'http'
import type https from 'http'
import { Server } from 'ws'
import type WebSocket from 'ws'

interface ManagedWebSocket extends WebSocket {
  isAlive?: boolean
}

export function createWebSocketServer(options: {
  server: http.Server | https.Server
  heartbeat: {
    interval: number
    timeout: number
  }
}) {
  const wss = new Server({ server: options.server })

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
  })
}
