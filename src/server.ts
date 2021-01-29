
import http from 'http'
import { IPrimusOptions, ISpark, Primus } from 'typestub-primus'
import { LiveSession } from './live-session'
import { App, Server } from './types/server'

export type ServerOptions = {
  // return void if refuse to establish live session
  createSession: (spark: ISpark) => LiveSession | void
  client_script?: string
}

export type StartServerOptions = {
  port: number
  prehook?: (app: App, sever: Server) => void
  primusOptions?: IPrimusOptions
  onListen?: (port: number) => void
  handler: express.Handler
} & ServerOptions

function defaultOnListen(port: number) {
  console.log('listening on http://0.0.0.0:' + port)
}

export type Servers = {
  app: express.Express
  server: Server
  primus: Primus | undefined
}

export function startServer(options: StartServerOptions): Servers {
  const port = options.port

  const app = express()
  const server = http.createServer(app)

  if (options.prehook) {
    options.prehook(app, server)
  }

  const primus = new Primus(server, options.primusOptions)

  app.use(options.handler)

  server.listen(port, () => (options.onListen || defaultOnListen)(port))
  return {
    app,
    server,
    primus,
  }
}
