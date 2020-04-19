import { initialRender } from './app'
import { attachServer, startServer } from './lib'
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

// to run as standalone web server
function standalone() {
  startServer(options)
}

// to be part of an express / nest.js application
function attach({ expressApp, httpServer }: any) {
  attachServer({
    app: expressApp,
    server: httpServer,
    ...options,
  })
}

standalone()
