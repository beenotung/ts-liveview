import type { VNode } from '../../../client/app/types'
import { getContext } from '../context.js'
import { EarlyTerminate, toAbsoluteHref, setNoCache } from '../helpers.js'

export function Update(
  attrs: {
    // to redirect static html client
    to: string

    // to update live websocket client
    selector: string
  } & (
    | {
        content: VNode
      }
    | {
        render: () => VNode
      }
  ),
): VNode {
  const context = getContext(attrs)
  if (context.type === 'ws') {
    const content = 'render' in attrs ? attrs.render() : attrs.content
    context.ws.send(['update-in', attrs.selector, content])
  } else {
    let href = attrs.to
    if (href.includes('?')) {
      href += '&'
    } else {
      href += '?'
    }
    href += 'time=' + Date.now()
    href = toAbsoluteHref(context.req, href)
    const res = context.res
    setNoCache(res)
    res.redirect(303, href)
  }
  throw EarlyTerminate
}
