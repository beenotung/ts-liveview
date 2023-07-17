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

app.use(cookieMiddleware)
app.use((req, res, next) => {
  logRequest(req, req.method, req.url)
  next()
})

if (config.development) {
  app.use('/js', express.static(join('dist', 'client')))
}
app.use('/js', express.static('build'))
app.use('/uploads', express.static(config.upload_dir))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

attachRoutes(app)

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.statusCode || 500)
  res.json({ error: String(error) })
})

const port = config.port
server.listen(port, () => {
  print(port)
  if (config.auto_open) {
    open(`http://localhost:${port}`)
  }
})
