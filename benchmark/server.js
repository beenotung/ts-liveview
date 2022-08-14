import spdy from 'spdy'
import fs from 'fs'
import express from 'express'
import { WebSocketServer } from 'ws'

let app = express()

app.use(express.static('benchmark'))
app.use(express.json())

app.post('/inc', (req, res) => {
  res.json({ count: req.body.count + 1 })
})

let server = spdy.createServer(
  {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem'),
  },
  app,
)

let wss = new WebSocketServer({ server })
wss.on('connection', socket => {
  socket.on('message', message => {
    // let text = message.toString()
    // console.log({ message, text })
    message = JSON.parse(message.toString())
    socket.send(JSON.stringify({ count: message.count + 1 }))
  })
})

let port = 8100
server.listen(port, () => {
  console.log('https://localhost:' + port)
})
