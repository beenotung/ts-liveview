import debug from 'debug'
import express from 'express'
import http from 'http'
import path from 'path'
import S from 's-js'
import { Primus } from 'typestub-primus'
import { attachServer, genPrimusScript, sampleInSRoot, Session } from './lib'
import { State } from './state'
import { renderChatroom } from './views/chatroom'
import { renderClock } from './views/clock'
import { renderRoot } from './views/root'

const log = debug('app:main')

const port = 3000
const app = express()
const server = http.createServer(app)
const primus = new Primus(server)

app.use('/', express.static(path.join('examples', 'chatroom-demo', 'public')))

function createSession(session: Session): Session | void {
  return S.root(dispose => {
    session.attachDispose(dispose)
    const state = new State(session)
    session.sendComponent(
      S.sample(() =>
        renderRoot(session.params.url, { type: 'session', session }, state),
      ),
    )
    session.live(() => renderClock(), { skipInitialSend: false })
    session.live(() => renderChatroom(state), { skipInitialSend: false })
    return session
  })
}

attachServer({
  app,
  server,
  title: 'chatroom',
  heads: [
    `<meta name="description" content="A chatroom demo using ts-liveview, a SSR SPA library">`,
    `<meta name="keywords" content="SSR, SPA, Typescript, Node.js, LiveView">`,
    `<meta name="author" content="ts-liveview"">`,
    genPrimusScript(),
  ],
  initialRender: (req, res) =>
    sampleInSRoot(() => renderRoot(req.url, { type: 'request', request: req })),
  createSession,
  primus,
})

server.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})
