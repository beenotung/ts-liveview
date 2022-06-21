import type { ClientMessage } from '../types'

export type ManagedWebsocket = {
  ws: WebSocket
  send(event: ClientMessage): void
  close(code?: number, reason?: string): void
}
