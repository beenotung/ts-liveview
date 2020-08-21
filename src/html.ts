import debug from 'debug'
import { getClientScriptName } from './config'
import { clientScriptTag } from './helpers/client-adaptor'
import { getIsHTMLDoc, MobileHtmlWrapper } from './helpers/mobile-html'
import { toHTML } from './helpers/render'
import { AttachServerOptions } from './server'
import { Request, Response } from './types/server'

const log = debug('liveview:html')

function isScriptTag(script: string): boolean {
  return !!script.trim().match(/<script/i)
}

function toScriptTag(script: string): string {
  return isScriptTag(script) ? script : `<script>${script}</script>`
}

export function sendInitialRender(
  req: Request,
  res: Response,
  mobileHTML: MobileHtmlWrapper,
  options: AttachServerOptions,
) {
  const view = options.initialRender(req, res)
  log('view:', view)
  const html = toHTML(view)
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

  if (options.client_script && isScriptTag(options.client_script)) {
    sendScript(options.client_script)
    return
  }
  if (!options.inline_script) {
    const url = getClientScriptName(options)
    sendScript(`<script async src="${url}"></script>`)
    return
  }
  if (options.client_script) {
    sendScript(toScriptTag(options.client_script))
    return
  }
  clientScriptTag.then(script => sendScript(script))
}
