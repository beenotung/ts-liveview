import { MONTH, SECOND } from '@beenotung/tslib/time'
import debug from 'debug'
import dotenv from 'dotenv'
import express from 'express'
import * as http from 'http'
import { makeCookieSession } from 'ts-liveview/dist/helpers/cookie-session'
import { createWebSocketServer } from 'ts-liveview/dist/websocket/server'
dotenv.config()

const PING_INTERVAL = SECOND * 30
const PING_TIMEOUT = PING_INTERVAL * 1.5
const SESSION_MAX_AGE = MONTH * 3
const SESSION_MIN_AGE = MONTH * 1
const DEBUG = true

const log = debug('test/ws/server.ts')
log.enabled = DEBUG

const app = express()

// proxy
app.set('trust proxy', 1)

// session
export interface AppSessionData {
  lastTime?: number // to keep session alive
}
declare module 'express-session' {
  // tslint:disable-next-line
  interface SessionData extends AppSessionData {}
}

if (!process.env.SESSION_SECRET) {
  console.error('missing SESSION_SECRET in env')
  process.exit(1)
}
const { session, decodeSession, autoRenewSession } = makeCookieSession<
  AppSessionData
>({
  maxAge: SESSION_MAX_AGE,
  minAge: SESSION_MIN_AGE,
  secret: process.env.SESSION_SECRET,
  lastTimeKey: 'lastTime',
})
app.use(session)
app.use(autoRenewSession)

// logger
app.use((req, res, next) => {
  log(req.method, req.url)
  next()
})

// static files
app.use('/build', express.static('build'))
app.use('/', express.static('public'))

// http server
const PORT = process.env.WEB_PORT || 8100
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})

// websocket
const wss = createWebSocketServer({
  server: { server },
  heartbeat: {
    interval: PING_INTERVAL,
    timeout: PING_TIMEOUT,
  },
  onConnection: (ws, req) => {
    decodeSession(req, session => {
      log('ws client session:', session.lastTime)
    })
    ws.addEventListener('message', event => {
      log('message', event.data)
    })
  },
})
log('wss:', wss.address())
