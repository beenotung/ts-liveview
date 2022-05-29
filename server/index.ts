import express from 'express'
import { Server as HttpServer } from 'http'
import ws from 'typestub-ws'
import { config } from './config.js'
import { join } from 'path'
import compression from 'compression'
import { debugLog } from './debug.js'
import { listenWSSConnection } from './ws/wss-lite.js'
import { appRouter, onWsMessage } from './app/app.js'
import { startSession, closeSession } from './app/session.js'
import { existsSync, unlinkSync } from 'fs'
import open from 'open'
import { cookieMiddleware } from './app/cookie.js'
import { listenWSSCookie } from './app/cookie.js'
import { print } from 'listening-on'
import { storeRequestLog } from '../db/store.js'

const log = debugLog('index.ts')
log.enabled = true

const app = express()
const server = new HttpServer(app)
const wss = new ws.WebSocketServer({ server })
listenWSSCookie(wss)
listenWSSConnection({
  wss,
  onConnection: ws => {
    log('attach ws:', ws.ws.protocol)
    startSession(ws)
  },
  onClose: (ws, code, reason) => {
    log('close ws:', ws.ws.protocol, code, reason)
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

app.use(compression())
if (config.development) {
  app.use('/js', express.static(join('dist', 'client')))
} else {
  app.use('/js', express.static('build'))
}
app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieMiddleware)

app.use(appRouter)

const PORT = config.port
server.listen(PORT, () => {
  print(PORT)
  if (config.development && existsSync('.open')) {
    open(`http://localhost:${PORT}`)
    unlinkSync('.open')
  }
})
