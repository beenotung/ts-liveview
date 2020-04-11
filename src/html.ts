import { templateToHTML } from './h'
import { clientScript } from './helpers/client-adaptor'
import { genMobileHTMLWrapper, getIsHTMLDoc } from './helpers/mobile-html'
import { Options } from './server'
import { Request, Response } from './types/server'

export function sendInitialRender(o: {
  options: Options
  req: Request
  res: Response
}) {
  const res = o.res
  const options = o.options

  let html = options.initialRender(o.req, res)
  html = typeof html === 'string' ? html : templateToHTML(html)
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
