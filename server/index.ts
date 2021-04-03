import express from 'express'
import { Server as HttpServer } from 'http'
import ws from 'ws'
import { config } from 'dotenv'
import { join } from 'path'
import compression from 'compression'
import { initView } from './ui.js'
import { loadTemplate } from './template.js'
import { VNodeToString } from './dom.js'
import { listenWSS } from './wss-reliable.js'

config()

let app = express()
let server = new HttpServer(app)
let wss = new ws.Server({ server })
listenWSS({
  wss,
  attachWS: ws => {
    console.log('attach ws:', ws.ws.protocol)
  },
  onClose: (ws, code, reason) => {
    console.log('close ws:', ws.ws.protocol, code, reason)
  },
  onMessage: (ws, event) => {
    console.log('received ws event:', event)
    const [type, value] = event
    switch (type) {
      case 'username':
        ws.send(['update', ['#username-out', [], [value]]])
        break
      case 'password':
        ws.send(['update', ['#password-out', [], [value]]])
        break
      default:
        console.log('unknown ws event:', event)
    }
  },
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
