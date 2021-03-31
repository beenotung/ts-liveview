import express from 'express'
import { Server as HttpServer } from 'http'
import type WebSocket from 'ws'
import type { Data } from 'ws'
import ws from 'ws'
import { config } from 'dotenv'
import { join } from 'path'
import compression from 'compression'
import { initView } from './ui.js'
import { loadTemplate } from './template.js'
import { VNodeToString } from './dom.js'
import { setupWSS } from './wss.js'

config()

let app = express()
let server = new HttpServer(app)
let wss = new ws.Server({ server })
setupWSS({
  wss,
  heartbeat: {
    interval: 30 * 1000,
    timeout: 45 * 1000,
  },
})

function send(ws: WebSocket, data: any) {
  ws.send(JSON.stringify(data))
}

wss.on('connection', ws => {
  console.log('ws connected')
  ws.on('message', (data: Data) => {
    let [type, value] = JSON.parse(String(data))
    switch (type) {
      case 'username':
        send(ws, ['update', ['#username-out', [], [value]]])
        break
      case 'password':
        send(ws, ['update', ['#password-out', [], [value]]])
        break
      default:
        console.log('unknown data:', data)
    }
  })
})

app.use(compression())
app.use(express.static('public'))
app.use(express.static(join('dist', 'client')))

let index = loadTemplate('index')

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  let content = index({
    title: 'LiveView Demo',
    app: VNodeToString(initView),
  })
  res.end(content)
})

let PORT = +process.env.PORT! || 8100
server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})
