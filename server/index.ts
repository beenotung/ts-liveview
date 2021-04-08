import express from 'express'
import { Server as HttpServer } from 'http'
import ws from 'ws'
import { config } from 'dotenv'
import { join } from 'path'
import compression from 'compression'
import { listenWSS } from './wss-reliable.js'
import { router } from './views/router.js'

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

app.use(router)

let PORT = +process.env.PORT! || 8100
server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})
