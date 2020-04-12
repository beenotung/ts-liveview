import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import { Template } from './h'
import { HTMLOptions } from './helpers/mobile-html'
import { sendInitialRender } from './html'
import { Session } from './session'
import { App, Request, Response, Server } from './types/server'

export type ServerOptions = {
  createSession?: (session: Session) => Session | void
  initialRender: (req: Request, res: Response) => string | Template
} & HTMLOptions

export type AttachServerOptions = {
  app: App
  server: Server
} & ServerOptions

export type StartServerOptions = {
  port: number
} & ServerOptions

export function attachServer(options: AttachServerOptions) {
  const app = options.app
  const createSession = options.createSession
  const server = options.server

  app.use('/', (req, res) => sendInitialRender({ req, res, options }))
  if (createSession) {
    const wss = new WebSocket.Server({ server })
    wss.on('connection', (ws, request) => {
      const session = createSession(new Session(ws, request))
      if (session && session.onMessage) {
        ws.on('message', session.onMessage)
      }
    })
  }
}

export function startServer(
  options: StartServerOptions,
): {
  app: express.Express
  server: Server
} {
  const port = options.port

  const app = express()
  const server = http.createServer(app)

  attachServer({ app, server, ...options })

  server.listen(port, () => {
    console.log('server started on port ' + port)
  })
  return {
    app,
    server,
  }
}
