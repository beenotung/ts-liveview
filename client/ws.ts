export type ManagedWebsocket<ClientEvent = any> = {
  ws: WebSocket
  send(event: ClientEvent): void
  close(code?: number, reason?: string): void
}
