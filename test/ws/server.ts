import debug from 'debug'
import express from 'express'
import * as http from 'http'
import path from 'path'
import { createWebSocketServer } from '../../src'

const log = debug('server.ts')

const SECOND = 1000
const MINUTE = SECOND * 60

const app = express()
const server = http.createServer(app)
const wss = createWebSocketServer({
  server: { server },
  heartbeat: {
    interval: SECOND * 5,
    timeout: SECOND * 5 * 2,
  },
  onConnection: ws => {
    console.log('onConnection', {
      type: ws.binaryType,
      ext: ws.extensions,
      url: ws.url,
    })
    ws.addEventListener('message', event => {
      console.log('message', event.data)
    })
  },
})

server.listen(8100, () => {
  console.log('listening on http://localhost:8100')
})

console.log('wss', wss.address())

app.use((req, res, next) => {
  log(req.method, req.url)
  next()
})

app.use('/build', express.static(path.join('client', 'build')))
app.use('/', express.static(path.join('client', 'public')))
