import { RouteContext as RouteMatch } from 'url-router.ts'
import { View } from './view'
import express from 'express'
import { ManagedWebsocket } from '../wss'
import { Server } from 'ws'

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
  ws: ManagedWebsocket
  wss: Server
  rest: any[]
}
