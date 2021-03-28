import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { config } from 'dotenv'
import { Primus } from 'typestub-primus'
import { join } from 'path'
import { mkdirSync, writeFileSync } from 'fs'
import compression from 'compression'
import minify from 'minify'
import {initView} from './ui.js'
import { loadTemplate } from './template.js'
import { VNodeToString } from './dom.js'

config()

let app = express()
let server = new HttpServer(app)
let io = new SocketIOServer(server)
let primus = new Primus(server)

let public_js = join('public', 'js')
mkdirSync(public_js, { recursive: true })
let primus_js = join(public_js, 'primus.js')
primus.save(primus_js)
minify(primus_js)
  .then((content: string) =>
    writeFileSync(join(public_js, 'primus.min.js'), content),
  )
  .catch((err: any) => {
    console.log('failed to minify primus.js:', err)
  })

io.on('connection', socket => {
  console.log('socket.io connected:', socket.id)
  socket.on('echo', data => {
    socket.emit('echo', data)
  })
})

primus.on('connection', spark => {
  console.log('primus.js connected:', spark.id)
  spark.on('data', data => {
    if (!'echo') {
      spark.write(data)
      return
    }
    let [type, value] = data
    switch (type) {
      case 'username':
        spark.write(['update', ['#username-out', [], [value]]])
        break
      case 'password':
        spark.write(['update', ['#password-out', [], [value]]])
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
    app: VNodeToString(initView)
  })
  res.end(content)
})

let PORT = +process.env.PORT! || 8100
server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})
