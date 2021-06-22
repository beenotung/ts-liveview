import { ServerMessage } from '../../client'
import type { ManagedWebsocket } from '../ws/wss'

export type Session = {
  ws: ManagedWebsocket<ServerMessage>
  url?: string
}

export let sessions = new Map<ManagedWebsocket<ServerMessage>, Session>()

export function startSession(ws: ManagedWebsocket<ServerMessage>) {
  // TODO init session with url
  sessions.set(ws, { ws })
}

export function closeSession(ws: ManagedWebsocket<ServerMessage>) {
  sessions.delete(ws)
}

export function setSessionUrl(ws: ManagedWebsocket, url: string) {
  let session = sessions.get(ws)
  if (session) {
    session.url = url
  } else {
    sessions.set(ws, { ws, url })
  }
}
