import type { WsContext } from './context.js'
import { listenWSS } from '../ws/wss-reliable.js'
import { Server } from 'ws'

class Session {
  constructor(public ws: WsContext['ws']) {}
}

let sessions = new Map<WsContext['ws'], Session>()

export function startSession(ws: WsContext['ws']) {
  let session = new Session(ws)
  sessions.set(ws, session)
}

export function stopSession(ws: WsContext['ws']) {
  let session = sessions.get(ws)
  if (!session) return
}

export function attachLiveSession(wss: Server) {
  listenWSS({
    wss,
    onConnection(ws) {},
    onClose(ws, code, reason) {},
    onMessage(event, ws, wss) {},
  })
}
