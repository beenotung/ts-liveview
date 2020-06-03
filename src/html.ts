import debug from 'debug'
import { viewToHTML } from './h-client'
import { clientScript } from './helpers/client-adaptor'
import { genMobileHTMLWrapper, getIsHTMLDoc } from './helpers/mobile-html'
import { AttachServerOptions } from './server'
import { Request, Response } from './types/server'

const log = debug('liveview:html')

export function sendInitialRender(
  req: Request,
  res: Response,
  options: AttachServerOptions,
) {
  const view = options.initialRender(req, res)
  log('view:', view)
  const html = viewToHTML(view, new Map())
  log('html:', html)
  const mobileHTML = genMobileHTMLWrapper(options)
  const isHTMLDoc = getIsHTMLDoc(html)
  if (!isHTMLDoc) {
    res.write(mobileHTML.pre_body)
  }
  res.write(html)
  const defer = () => {
    if (!isHTMLDoc) {
      res.write(mobileHTML.post_body)
    }
    res.end()
  }
  if (!options.createSession) {
    defer()
    return
  }
  clientScript.then(script => {
    res.write(script)
    defer()
  })
}
