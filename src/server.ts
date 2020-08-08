import debug from 'debug'
import express from 'express'
import http from 'http'
import S from 's-js'
import { IPrimusOptions, Primus } from 'typestub-primus'
import { Component } from './h'
import { genMobileHTMLWrapper, HTMLOptions } from './helpers/mobile-html'
import { sendInitialRender } from './html'
import { Session } from './session'
import { App, Request, Response, Server } from './types/server'
import { PrimitiveView } from './types/view'

const log = debug('liveview:server')

export type ServerOptions = {
  /* will be called inside a s-root per client session */
  createSession?: (session: Session) => Session | void
  initialRender: (req: Request, res: Response) => PrimitiveView | Component
} & HTMLOptions

export type AttachServerOptions = {
  app: App
  server?: Server
  primus?: Primus
  client_script?: string
} & ServerOptions

export type StartServerOptions = {
  port: number
  prehook?: (app: App, sever: Server) => void
  primusOptions?: IPrimusOptions
} & ServerOptions

export function attachServer(options: AttachServerOptions) {
  const app = options.app
  // const server = options.server
  const primus = options.primus
  const createSession = options.createSession

  const mobileHTML = genMobileHTMLWrapper(options)
  app.use('/', (req, res) => sendInitialRender(req, res, mobileHTML, options))

  if (createSession && primus) {
    primus.on('connection', spark => {
      const connection = (spark.request as http.IncomingMessage).connection
      log('spark connection:', {
        id: spark.id,
        address: spark.address,
        query: spark.query,
        remote: {
          address: connection.remoteAddress,
          port: connection.remotePort,
        },
        local: {
          address: connection.localAddress,
          port: connection.localPort,
        },
      })
      S.root(dispose => {
        const session = new Session(spark)
        session.attachDispose(dispose)
        const result = createSession(session)
        if (!result) {
          dispose() // the application has rejected this session
        }
      })
    })
  }
}

export function startServer(
  options: StartServerOptions,
): {
  app: express.Express
  server: Server
  primus: Primus | undefined
} {
  const port = options.port

  const app = express()
  const server = http.createServer(app)

  if (options.prehook) {
    options.prehook(app, server)
  }

  const primus = options.createSession
    ? new Primus(server, options.primusOptions)
    : undefined

  attachServer({ app, server, primus, ...options })

  server.listen(port, () => {
    console.log('server started on port ' + port)
  })
  return {
    app,
    server,
    primus,
  }
}
