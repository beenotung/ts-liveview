import express from 'express'
import socketIO from 'socket.io'
import http from 'http'
import dotenv from 'dotenv'
import { Primus } from 'typestub-primus'
import path from 'path'
import fs from 'fs'
import compression from 'compression'
import minify from 'minify'

dotenv.config()

let app = express()
let server = http.createServer(app)
let io = new socketIO.Server(server)
let primus = new Primus(server)

let public_js = path.join('public', 'js')
fs.mkdirSync(public_js, { recursive: true })
let primus_js = path.join(public_js, 'primus.js')
primus.save(primus_js)
minify(primus_js)
  .then(content =>
    fs.writeFileSync(path.join(public_js, 'primus.min.js'), content),
  )
  .catch(err => {
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
    console.log('data:', data)
    let [type, value] = data
    switch (type) {
      case 'username':
        spark.write(['update', ['#username-out', [], [value]]])
        break
      case 'password':
        spark.write(['update', ['#password-out', [], [value]]])
        break
    }
  })
})

app.use(compression())
app.use(express.static('public'))

let PORT = +process.env.PORT! || 8100
server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`)
})
