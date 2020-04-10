import { toHTML } from './h'
import { clientScript } from './helpers/client-adaptor'
import {
  getIsHTMLDoc,
  mobile_html_post,
  mobile_html_pre,
} from './helpers/mobile-html'
import { Options } from './server'
import { Request, Response } from './types'

export function initialRender(o: {
  options: Options
  req: Request
  res: Response
}) {
  const res = o.res
  const options = o.options

  let html = options.initialRender(o.req, res)
  html = typeof html === 'string' ? html : toHTML(html)
  const isHTMLDoc = getIsHTMLDoc(html)
  if (!isHTMLDoc) {
    res.write(mobile_html_pre)
  }
  res.write(html)
  const defer = () => {
    if (!isHTMLDoc) {
      res.write(mobile_html_post)
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
