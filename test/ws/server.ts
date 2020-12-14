import compression from 'compression'
import express from 'express'
import minify from 'express-minify'
import * as http from 'http'
import { Primus } from 'typestub-primus'

const app = express()
const server = http.createServer(app)
const primus = new Primus(server)

primus.save('public/ws.js')
primus.on('connection', spark => {
  console.log('connection', spark.id)
  spark.on('data', data => {
    console.log('data', data)
  })
  spark.write({ from: 'server', msg: 'hi' })
})

app.use(compression() as express.Handler)
app.use(minify() as express.Handler)
app.use(express.static('public'))

const port = 8100
server.listen(port, '0.0.0.0', () => {
  console.log(`listening on http://localhost:${port}`)
})
