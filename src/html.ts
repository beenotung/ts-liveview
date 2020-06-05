import debug from 'debug'
import { viewToHTML } from './h-client'
import { clientScript } from './helpers/client-adaptor'
import { getIsHTMLDoc, MobileHtmlWrapper } from './helpers/mobile-html'
import { AttachServerOptions } from './server'
import { Request, Response } from './types/server'

const log = debug('liveview:html')

function isScriptTag(s: string) {
  return !!s.trim().match(/<script/i)
}

export function sendInitialRender(
  req: Request,
  res: Response,
  mobileHTML: MobileHtmlWrapper,
  options: AttachServerOptions,
) {
  const view = options.initialRender(req, res)
  log('view:', view)
  const html = viewToHTML(view, new Map())
  log('html:', html)
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

  function sendScript(script: string) {
    res.write(script)
    defer()
  }

  if (options.client_script) {
    sendScript(
      isScriptTag(options.client_script)
        ? options.client_script
        : `<script>${options.client_script}</script>`,
    )
    return
  }
  clientScript.then(script => sendScript(script))
}
