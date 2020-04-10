import express from 'express'
import http from 'http'
import WebSocket from 'ws'
import { Template } from './h'
import { initialRender } from './html'
import { Session } from './session'
import { Request, Response, Server } from './types'

export type Options = {
  port: number
  createSession?: (session: Session) => Session | void
  initialRender: (req: Request, res: Response) => string | Template
}

export function startServer(options: Options): {
  app: express.Express,
  server: Server
} {
  const { port, createSession } = options
  const app = express()
  app.use('/', (req, res) => initialRender({ req, res, options }))
  const server = http.createServer(app)
  if (createSession) {
    const wss = new WebSocket.Server({ server })
    wss.on('connection', (ws, request) => {
      const session = createSession(new Session(ws, request))
      if (session && session.onMessage) {
        ws.on('message', session.onMessage)
      }
    })
  }
  server.listen(port, () => {
    console.log('server started on port ' + port)
  })
  return {
    app,
    server,
  }
}
