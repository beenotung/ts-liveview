import { debugLog } from '../debug.js'
import type { ManagedWebsocket } from '../ws/wss'

let log = debugLog('session.ts')
log.enabled = true

export type Session = {
  ws: ManagedWebsocket
  locales?: string
  timeZone?: string
  url?: string
  onCloseListeners: Array<(session: Session) => void>
}

export let sessions = new Map<ManagedWebsocket, Session>()

export function startSession(ws: ManagedWebsocket) {
  // TODO init session with url
  sessions.set(ws, { ws, onCloseListeners: [] })
}

export function closeSession(ws: ManagedWebsocket) {
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
