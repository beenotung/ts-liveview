import WebSocket, { Server } from 'ws'

export type ManagedWebsocket<ServerEvent = any> = {
  ws: WebSocket
  send(event: ServerEvent): void
  close(code?: number, reason?: string): void
}

export type OnWsMessage<ClientEvent = any> = (
  event: ClientEvent,
  ws: ManagedWebsocket,
  wss: Server,
) => void
