import * as express from 'express'
import path from 'path'
import { initialRender } from './app'
import { App, attachServer, Server, startServer } from './lib'
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
  app.use('/', express.static(path.join('demo-app', 'public')))
}

// to run as standalone web server
function standalone() {
  startServer({
    ...options,
    prehook: app => serveStatic(app),
  })
}

// to be part of an express / nest.js application
function attach(o: {
  app: App // e.g. express app / nest.js app
  server: Server // http server
}) {
  serveStatic(o.app)
  attachServer({
    ...o,
    ...options,
  })
}

standalone()
