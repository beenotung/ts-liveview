import WebSocket, { Server } from 'ws'
import { ServerMessage } from '../../client'

export type ManagedWebsocket<Event extends ServerMessage = any> = {
  ws: WebSocket
  send(event: Event): void
  close(code?: number, reason?: string): void
}

export type OnWsMessage<ClientMessage = any> = (
  event: ClientMessage,
  ws: ManagedWebsocket,
  wss: Server,
) => void
