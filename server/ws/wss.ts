import type WebSocket from 'ws'
import type { Server } from 'ws'
import type { ClientMessage, ServerMessage } from '../../client/types'

export type ManagedWebsocket = {
  ws: WebSocket
  wss: Server
  send(event: ServerMessage): void
  close(code?: number, reason?: Buffer): void
}

export type OnWsMessage = (
  event: ClientMessage,
  ws: ManagedWebsocket,
  wss: Server,
) => void
