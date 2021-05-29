import type { RouteContext as RouteMatch } from 'url-router.ts'
import type express from 'express'
import type { ManagedWebsocket } from '../ws/wss.js'
import type { Server } from 'ws'
import type { ServerMessage } from '../../client/index.js'

export type Context = ExpressContext | WsContext

export type RouteContext = {
  url: string
  route: RouteMatch<ContextHandler>
}

export type ContextHandler = (context: Context) => void

export type ExpressContext = RouteContext & {
  type: 'express'
  req: express.Request
  res: express.Response
  next: express.NextFunction
}
export type WsContext = RouteContext & {
  type: 'ws'
  ws: ManagedWebsocket<ServerMessage>
  wss: Server
  rest: any[]
}
