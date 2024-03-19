import express, { Request, Response, NextFunction } from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import { config } from './config.js'
import { join } from 'path'
import { debugLog } from './debug.js'
import { listenWSSConnection } from './ws/wss-lite.js'
import { attachRoutes, onWsMessage } from './app/app.js'
import { startSession, closeSession } from './app/session.js'
import open from 'open'
import { cookieMiddleware } from './app/cookie.js'
import { listenWSSCookie } from './app/cookie.js'
import { print } from 'listening-on'
import { HttpError } from './http-error.js'
import { logRequest } from './app/log.js'
import { env } from './env.js'

const log = debugLog('index.ts')
log.enabled = true

const app = express()
const server = http.createServer(app)
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
  logRequest(req, req.method, req.url, null)
  next()
})

if (config.development) {
  app.use('/js', express.static(join('dist', 'client')))
}
app.use('/js', express.static('build'))
app.use('/uploads', express.static(env.UPLOAD_DIR))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieMiddleware)

attachRoutes(app)

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode || 500)
  if (error instanceof Error && !(error instanceof HttpError)) {
    console.error(error)
  }
  res.json({ error: String(error) })
})

const port = env.PORT
server.listen(port, () => {
  print(port)
  if (config.auto_open) {
    open(`http://localhost:${port}`)
  }
})
