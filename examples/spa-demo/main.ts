import express from 'express'
import http from 'http'
import path from 'path'
import { Primus } from 'typestub-primus'
import { initialRender } from './app'
import {
  App,
  attachServer,
  genClientCode,
  genInlinePrimusScript,
  genPrimusScript,
  minifyHTML,
  minifyJS,
  Server,
  startServer,
} from './lib'
import { createSession } from './session'

// tslint:disable no-unused-declaration

const options = {
  port: +process.env.PORT! || 3333,
  title: 'TS LiveView Demo',
  heads: [
    `
  <meta name="description" content="server-side rendered reactive single-page app">
  <meta http-equiv="x-ua-compatible" content="IE=Edge">
`,
  ],
  createSession,
  initialRender,
}

function serveStatic(app: App) {
  app.use('/', express.static(path.join('examples', 'spa-demo', 'public')))
}

// to run as standalone web server
function standalone() {
  startServer({
    ...options,
    heads: [
      ...options.heads,
      // load primus.js in separate request in the head (not minified)
      genPrimusScript(),
    ],
    prehook: app => serveStatic(app),
  })
}

// to be part of an express / nest.js application
async function attach(o: {
  app: App // e.g. express app / nest.js app
  server: Server // http server
  primus: Primus // websocket middleware
}) {
  serveStatic(o.app)
  attachServer({
    ...o,
    ...options,
    // inline and minify primus.js at the end of body to avoid separate request
    client_script: await minifyJS(
      minifyHTML(
        genInlinePrimusScript(o.primus) + '\n' + (await genClientCode()),
      ),
    ),
  })
}

function main(mode: 'prod' | 'dev') {
  if (mode === 'dev') {
    // do not minify
    standalone()
    return
  }
  // minify and inline scripts
  const app = express()
  const server = http.createServer(app)
  const primus = new Primus(server)
  attach({
    app,
    server,
    primus,
  }).then(() => {
    server.listen(options.port, () => {
      console.log('listening on http://localhost:' + options.port)
    })
  })
}

main('prod')
