import express, { Request, Response, NextFunction } from 'express'
import spdy from 'spdy-fixes'
import { WebSocketServer } from 'ws'
import { config } from './config.js'
import { join } from 'path'
import compression from 'compression'
import { debugLog } from './debug.js'
import { listenWSSConnection } from './ws/wss-lite.js'
import { attachRoutes, onWsMessage } from './app/app.js'
import { startSession, closeSession } from './app/session.js'
import open from 'open'
import { cookieMiddleware } from './app/cookie.js'
import { listenWSSCookie } from './app/cookie.js'
import { print } from 'listening-on'
import { storeRequestLog } from '../db/store.js'
import { HttpError } from './http-error.js'

const log = debugLog('index.ts')
log.enabled = true

const app = express()
const server = spdy.createServer(config.serverOptions, app)
const wss = new WebSocketServer({ server })
listenWSSCookie(wss)
listenWSSConnection({
  wss,
  onConnection: ws => {
    log('attach ws:', ws.ws.protocol)
    startSession(ws)
  },
  onClose: (ws, code, reason) => {
    log('close ws:', ws.ws.protocol, code, String(reason))
    closeSession(ws)
  },
  onMessage: onWsMessage,
})

app.use((req, res, next) => {
  storeRequestLog({
    method: req.method,
    url: req.url,
    user_agent: req.headers['user-agent'] || null,
  })
  next()
})

if (!config.behind_proxy) {
  app.use(compression())
}
if (config.development) {
  app.use('/js', express.static(join('dist', 'client')))
}
app.use('/js', express.static('build'))
app.use('/uploads', express.static(config.upload_dir))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieMiddleware)

attachRoutes(app)

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode || 500)
  res.json({ error: String(error) })
})

const port = config.port
const protocol = config.serverOptions.key ? 'https' : 'http'
server.listen(port, () => {
  print({ port, protocol })
  if (config.auto_open) {
    open(`${protocol}://localhost:${port}`)
  }
})
