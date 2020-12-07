import { Request, Response, NextFunction } from 'express'
import { getClientScriptName, getClientScript } from './config'
import { genMobileHTMLWrapper } from './helpers/mobile-html'
import { sendInitialRender } from './html'
import { AttachServerOptions, ServerOptions } from './server'
import express from 'express'

export function liveViewRoute(options: AttachServerOptions) {
  let app = express.Router()

  attachClientScriptHandler(app, options)

  const mobileHTML = genMobileHTMLWrapper(options)
  app.use((req, res, next) => {
    sendInitialRender(req, res, mobileHTML, options)
  })
}


async function attachClientScriptHandler(app: express.Router, options: ServerOptions) {
  const clientScriptUrl = getClientScriptName(options)

  app.get(clientScriptUrl, handler)

  let code = await getClientScript(options)

  function handler(req: Request, res: Response) {
    res.contentType('application/javascript')
    res.send(code)
  }
}

