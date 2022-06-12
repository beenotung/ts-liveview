import type { ServerMessage } from '../../../client'
import type { VNode } from '../../../client/jsx/types'
import { ExpressContext, getContext, getRouterContext } from '../context.js'
import { EarlyTerminate, toAbsoluteHref, setNoCache } from '../helpers.js'
import { setSessionUrl } from '../session.js'
import { renderRedirect } from './router.js'

export function Update(attrs: {
  // to redirect static html client
  to: string

  // to update live websocket client
  message: ServerMessage
}): VNode {
  const context = getRouterContext(attrs)
  if (context.type === 'ws') {
    context.ws.send(attrs.message)
    setSessionUrl(context.ws, attrs.to)
  } else {
    forceRedirectExpressSession(context, attrs.to)
  }
  throw EarlyTerminate
}

export function UpdateIn(
  attrs: {
    // to redirect static html client
    to: string

    // to update live websocket client
    selector: string

    title?: string
  } & (
    | {
        content: VNode
      }
    | {
        render: () => VNode
      }
  ),
): VNode {
  const context = getRouterContext(attrs)
  if (context.type === 'ws') {
    const content = 'render' in attrs ? attrs.render() : attrs.content
    if (attrs.title) {
      context.ws.send(['update-in', attrs.selector, content, attrs.title])
    } else {
      context.ws.send(['update-in', attrs.selector, content])
    }
    setSessionUrl(context.ws, attrs.to)
  } else {
    forceRedirectExpressSession(context, attrs.to)
  }
  throw EarlyTerminate
}

export function UpdateUrl(attrs: { href: string; status?: number }): VNode {
  const context = getContext(attrs)
  if (context.type === 'ws') {
    setSessionUrl(context.ws, attrs.href)
  } else if (context.type === 'express') {
    forceRedirectExpressSession(context, attrs.href)
  }
  throw EarlyTerminate
}

export function forceRedirectExpressSession(
  context: ExpressContext,
  href: string,
  status?: number,
) {
  if (href.includes('?')) {
    href += '&'
  } else {
    href += '?'
  }
  href += 'time=' + Date.now()
  href = toAbsoluteHref(context.req, href)
  const res = context.res
  if (res.headersSent) {
    res.end(renderRedirect(href))
  } else {
    setNoCache(res)
    res.redirect(status || 303, href)
  }
}
