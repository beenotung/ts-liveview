import { ServerMessage } from '../../client'
import type { ManagedWebsocket } from '../ws/wss'

export type Session = {
  ws: ManagedWebsocket<ServerMessage>
  url?: string
  onCloseListeners: Array<(session: Session) => void>
}

export let sessions = new Map<ManagedWebsocket<ServerMessage>, Session>()

export function startSession(ws: ManagedWebsocket<ServerMessage>) {
  // TODO init session with url
  sessions.set(ws, { ws, onCloseListeners: [] })
}

export function closeSession(ws: ManagedWebsocket<ServerMessage>) {
  const session = sessions.get(ws)
  if (!session) return
  sessions.delete(ws)
  session.onCloseListeners.forEach(fn => fn(session))
}

export function getWSSession(ws: ManagedWebsocket) {
  let session = sessions.get(ws)
  if (!session) {
    session = { ws, onCloseListeners: [] }
    sessions.set(ws, session)
  }
  return session
}

export function setSessionUrl(ws: ManagedWebsocket, url: string) {
  getWSSession(ws).url = url
}

export function onWsSessionClose(
  ws: ManagedWebsocket,
  fn: (session: Session) => void,
) {
  getWSSession(ws).onCloseListeners.push(fn)
}
