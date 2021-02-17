import { MINUTE, MONTH, SECOND } from '@beenotung/tslib/time'
import debug from 'debug'
import dotenv from 'dotenv'
import express from 'express'
import * as http from 'http'
import { makeCookieSession } from 'ts-liveview/dist/helpers/cookie-session'
import { createWebSocketServer } from 'ts-liveview/dist/websocket/server'
dotenv.config()

const log = debug('test/ws/server.ts')
log.enabled = true

const INTERVAL = 'dev' ? SECOND * 5 : 30 * MINUTE

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
  maxAge: MONTH * 3,
  minAge: MONTH * 1,
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
    interval: INTERVAL,
    timeout: INTERVAL * 2,
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
