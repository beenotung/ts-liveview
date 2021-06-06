import express from 'express'
import { Server } from 'ws'
import { ServerMessage } from '../../client'
import { ManagedWebsocket } from '../ws/wss'

export type Context = ExpressContext | LiveContext

export type ExpressContext = {
  type: 'express'
  req: express.Request
  res: express.Response
  next: express.NextFunction
}

export type LiveContext = {
  type: 'ws'
  ws: ManagedWebsocket<ServerMessage>
  wss: Server
  url?: string
  event?: string
  args?: any[]
}

export function getUrl(context: Context): string {
  if (context.type === 'express') {
    return context.req.url
  }
  return context.url!
}
