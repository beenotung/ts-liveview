import express from 'express'
import { readFileSync } from 'fs'
import http2 from 'http2'
import { print } from 'listening-on'
import http2Express from 'http2-express-bridge'

let app = http2Express(express)

app.use(express.static('public'))

app.post('/test.stream', (req, res) => {
  console.log('post stream')
  res.end('ok')
})

let server = http2.createSecureServer({
  key: readFileSync('server.key'),
  cert: readFileSync('server.cert'),
  allowHTTP1: true,
})

server.on('request', (req, res) => {
  console.log(
    req.method,
    req.url,
    'http version:',
    req.httpVersion,
    'content-type:',
    req.headers['content-type'],
  )
  app(req as any, res as any)
})

let port = 8200
server.listen(port, () => {
  print({ port, protocol: 'https' })
})
