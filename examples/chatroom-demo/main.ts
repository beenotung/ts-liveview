import debug from 'debug'
import express from 'express'
import http from 'http'
import { join } from 'path'
import S from 's-js'
import { Primus } from 'typestub-primus'
import { makeClientCode } from './client-code'
import { attachServer, minifyView, sampleInSRoot, Session } from './lib'
import { State } from './state'
import { renderChatroom } from './views/chatroom'
import { renderClock } from './views/clock'
import { renderRoot } from './views/root'

const log = debug('app:main')

const port = +process.env.PORT! || 3000
const app = express()
const server = http.createServer(app)
const primus = new Primus(server)

primus.save(join(__dirname, 'client', 'ws.js'))

app.use('/', express.static(join(__dirname, 'public')))

function createSession(session: Session): Session | void {
  log('start a session')
  S.cleanup(() => {
    log('stop a session')
  })
  const state = new State(session)
  session.sendComponent(
    S.sample(() =>
      renderRoot(session.params.url, { type: 'session', session }, state),
    ),
  )
  session.live(() => renderClock(), { skipInitialSend: false })
  session.live(() => renderChatroom(state), { skipInitialSend: false })
  return session
}

async function main() {
  attachServer({
    app,
    server,
    title: 'chatroom',
    heads: [
      `<meta name="description" content="A chatroom demo using ts-liveview, a SSR SPA library">`,
      `<meta name="keywords" content="SSR, SPA, Typescript, Node.js, LiveView">`,
      `<meta name="author" content="ts-liveview">`,
    ],
    initialRender: (req, res) => {
      const view = sampleInSRoot(() =>
        renderRoot(req.url, { type: 'request', request: req }),
      )
      return minifyView(view)
    },
    createSession,
    primus,
    client_script: await makeClientCode(primus),
  })

  server.listen(port, () => {
    console.log('listening on http://localhost:' + port)
  })
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
