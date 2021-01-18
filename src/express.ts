/**@deprecated*/

import { Request, Response } from 'express'
import express from 'express'
import { getClientScript, getClientScriptName } from './config'
import { genMobileHTMLWrapper } from './helpers/mobile-html'
import { sendInitialRender } from './html'
import { AttachServerOptions, ServerOptions } from './server'

export function liveViewRoute(options: AttachServerOptions) {
  const app = express.Router()

  attachClientScriptHandler(app, options)

  const mobileHTML = genMobileHTMLWrapper(options)
  app.use((req, res, next) => {
    sendInitialRender(req, res, mobileHTML, options)
  })
}

async function attachClientScriptHandler(
  app: express.Router,
  options: ServerOptions,
) {
  const clientScriptUrl = getClientScriptName(options)

  app.get(clientScriptUrl, handler)

  const code = await getClientScript(options)

  function handler(req: Request, res: Response) {
    res.contentType('application/javascript')
    res.send(code)
  }
}
