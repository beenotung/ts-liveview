import express from 'express'
import { Server as HttpServer } from 'http'
import ws from 'typestub-ws'
import { config } from './config.js'
import { join } from 'path'
import compression from 'compression'
import { debugLog } from './debug.js'
import { listenWSSConnection } from './ws/wss-lite.js'
import { expressRouter, onWsMessage } from './app/app.js'
import { startSession, closeSession } from './app/session.js'
import { existsSync, unlinkSync } from 'fs'
import open from 'open'
import { cookieMiddleware } from './app/cookie.js'
import { listenWSSCookie } from './app/cookie.js'

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

app.use(compression())
app.use(express.static('public'))
app.use(express.static(join('dist', 'client')))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieMiddleware)

app.use(expressRouter)

const PORT = config.port
server.listen(PORT, () => {
  log(`listening on http://localhost:${PORT}`)
  if (config.development && existsSync('.open')) {
    open(`http://localhost:${PORT}`)
    unlinkSync('.open')
  }
})
