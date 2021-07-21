import WebSocket, { Server } from 'ws'
import { ServerMessage } from '../../client'

export type ManagedWebsocket<Event extends ServerMessage = any> = {
  ws: WebSocket
  send(event: Event): void
  close(code?: number, reason?: string): void
}

export type OnWsMessage<ClientEvent = any> = (
  event: ClientEvent,
  ws: ManagedWebsocket,
  wss: Server,
) => void
