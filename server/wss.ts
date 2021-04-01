import type { Data, Server as WSServer } from 'ws'
import type WebSocket from 'ws'

export interface ManagedWebSocket extends WebSocket {
  isAlive?: boolean
}

function pongCallback() {
  console.log('recevied pong:', arguments)
  // @ts-ignore
  ;(this as ManagedWebSocket).isAlive = true
}

function onConnection(ws: ManagedWebSocket) {
  ws.isAlive = true
  ws.on('pong', pongCallback)
  ws.on('message',(data:Data)=>{
    if((data as Buffer).length===0){
      pongCallback // TODO
    }
  })
}

function pingCallback(error: any) {
  if (error) {
    console.log('Failed to ping ws:', error)
  }
}

function pingWS(ws: ManagedWebSocket) {
  if (ws.isAlive === false) {
    ws.terminate()
    return
  }
  ws.isAlive = false
  console.log('send ping')
  ws.ping(pingCallback)
}

export function setupWSS(options: {
  wss: WSServer
  heartbeat: {
    interval: number
    timeout: number
  }
  onMessage: (ws: WebSocket, event: Data) => void
}) {
  const { wss } = options
  wss.on('connection', onConnection)
  function pingAll() {
    wss.clients.forEach(pingWS)
  }
  const heartBeatTimer = setInterval(pingAll, options.heartbeat.interval)
}
