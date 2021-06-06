import express from 'express'
import { Server as HttpServer } from 'http'
import ws from 'ws'
import { config } from 'dotenv'
import { join } from 'path'
import compression from 'compression'
import { debugLog } from './debug.js'
import { listenWSS } from './ws/wss-reliable.js'
import { expressRouter, onWsMessage } from './app/app.js'

config()
let log = debugLog('index.ts')
log.enabled = true

let app = express()
let server = new HttpServer(app)
let wss = new ws.Server({ server })
listenWSS({
  wss,
  onConnection: ws => {
    log('attach ws:', ws.ws.protocol)
  },
  onClose: (ws, code, reason) => {
    log('close ws:', ws.ws.protocol, code, reason)
  },
  onMessage: onWsMessage,
})

app.use(compression())
app.use(express.static('public'))
app.use(express.static(join('dist', 'client')))

app.use(expressRouter)

let PORT = +process.env.PORT! || 8100
server.listen(PORT, () => {
  log(`listening on http://localhost:${PORT}`)
})
