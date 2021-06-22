import { ServerMessage } from '../../client'
import type { ManagedWebsocket } from '../ws/wss'

export let allWS: ManagedWebsocket<ServerMessage>[] = []

export function startSession(ws: ManagedWebsocket<ServerMessage>) {
  allWS.push(ws)
}

export function closeSession(ws: ManagedWebsocket<ServerMessage>) {
  allWS.splice(allWS.indexOf(ws))
}

export let sessionUrl = new WeakMap<ManagedWebsocket<ServerMessage>, string>()
