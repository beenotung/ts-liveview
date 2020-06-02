import { attachServer, startServer } from './lib'
import express from 'express'
import http from 'http'
import { Primus, IPrimusOptions } from 'typestub-primus'
import { renderRoot } from './views/root'

let port = 3000
let app = express()
let server = http.createServer(app)
let primus = new Primus(server)


attachServer({
  app,
  server,
  title: 'chatroom',
  heads: [
    `<meta name="description" content="A chatroom demo using ts-liveview, a SSR SPA library">`,
    `<meta name="keywords" content="SSR, SPA, Typescript, Node.js, LiveView">`,
    `<meta name="author" content="ts-liveview"">`,
    `<script src="/primus/primus.js"></script>`,
  ],
  initialRender: (req, res) => {
    return renderRoot(req.url, { type: 'request', request: req })
  },
  createSession: session => {
    let render = () => renderRoot(session.spark.request.path, { type: 'session', session })
    session.live(render, { skipInitialSend: false })
    return session
  },
  primus,
})

server.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})
