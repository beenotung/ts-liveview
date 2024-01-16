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
import { logRequest } from './app/log.js'
import { clearInvalidUserId } from './app/auth/user.js'
import { env } from './env.js'
import { HttpError, EarlyTerminate } from './exception.js'

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
app.use(clearInvalidUserId)
app.use((req, res, next) => {
  logRequest(req, req.method, req.url, null)
  next()
})

if (config.development) {
  app.use('/js', express.static(join('dist', 'client')))
}
app.use('/js', express.static('build'))
app.use('/uploads', express.static(env.UPLOAD_DIR))
app.use('/npm/@ionic/core', express.static('node_modules/@ionic/core'))
app.use('/npm/swiper', express.static('node_modules/swiper'))
app.use('/npm/jquery', express.static('node_modules/jquery'))
app.use('/npm/datatables.net', express.static('node_modules/datatables.net'))
app.use(
  '/npm/datatables.net-dt',
  express.static('node_modules/datatables.net-dt'),
)
app.use('/npm/chart.js', express.static('node_modules/chart.js'))
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

attachRoutes(app)

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  if ((error as unknown) == EarlyTerminate) {
    return
  }
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
