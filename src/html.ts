import { toHTML } from './h'
import { autoWrapMobileHTML } from './helpers/mobile-html'
import { Options } from './server'
import { clientScript } from './helpers/client-adaptor'
import { Request, Response } from './types'

export function initialRender(o: {
  options: Options
  req: Request
  res: Response
}) {
  const { req, res, options } = o
  let html = o.options.initialRender(req, res)
  html = typeof html === 'string' ? html : toHTML(html)
  html = autoWrapMobileHTML(html)
  if (!options.createSession) {
    res.end(html)
    return
  }
  clientScript.then(s => res.end(html + s))
}
