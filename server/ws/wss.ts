import WebSocket, { Server } from 'typestub-ws'
import { ServerMessage } from '../../client'

export type ManagedWebsocket<Event extends ServerMessage = any> = {
  ws: WebSocket
  wss: Server
  send(event: Event): void
  close(code?: number, reason?: Buffer): void
}

export type OnWsMessage<ClientMessage = any> = (
  event: ClientMessage,
  ws: ManagedWebsocket,
  wss: Server,
) => void
