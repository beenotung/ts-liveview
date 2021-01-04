import compression from 'compression'
import cookieParser from 'cookie-parser'
import express, { Handler } from 'express'
import minify from 'express-minify'
import http from 'http'
import path from 'path'
import { getComponentTitle, minify_dir, toHTML } from 'ts-liveview'
import { Primus } from 'typestub-primus'
import { defaultTitle, htmlTemplate, scripts } from './config'
import { router } from './router'
import { appSessionMiddleware, attachSession } from './session'

const port = +process.env.PORT! || 8100
const app = express()
const server = http.createServer(app)
const primus = new Primus(server)

primus.save(path.join('client', 'ws.js'))

if (!process.env.TS_NODE_DEV) {
  app.use(compression() as express.Handler)
  app.use(minify() as express.Handler)
  minify_dir('build')
}

app.use('/client', express.static(path.join('build', 'client')))
app.use('/web_modules', express.static(path.join('build', 'web_modules')))
app.use('/icon', express.static(path.join('public', 'icon')))
app.use(cookieParser())
app.use(appSessionMiddleware)

app.use(
  router.createExpressMiddleware(component => {
    return htmlTemplate.toHTML({
      title: getComponentTitle(component) || defaultTitle,
      headInnerHTML: scripts,
      bodyInnerHTML: toHTML(component),
    })
  }) as Handler,
)
attachSession(primus, router)

server.listen(port, '0.0.0.0', () => {
  console.log(`listening on http://localhost:${port}`)
  console.log(`listening on http://127.0.0.1:${port}`)
  console.log(`listening on http://0.0.0.0:${port}`)
})
