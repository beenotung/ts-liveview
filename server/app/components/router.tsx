import { o } from '../jsx/jsx.js'
import { castDynamicContext, Context } from '../context.js'
import type { Node, NodeList } from '../jsx/types'
import { Router as UrlRouter } from 'url-router.ts'
import { Fragment } from './fragment.js'
import { EarlyTerminate } from '../helpers.js'
import { setSessionUrl } from '../session.js'

export type LinkAttrs = {
  'no-history'?: boolean
  'href': string
  'onclick'?: never
  [name: string]: unknown
  'children'?: NodeList
}

export function Link(attrs: LinkAttrs) {
  const { 'no-history': quiet, children, ...aAttrs } = attrs
  const onclick = quiet ? `emitHref(event,'q')` : `emitHref(event)`
  if (!children) {
    console.warn('Link attrs:', attrs)
    console.warn(new Error('Link with empty content'))
  }
  return (
    <a onclick={onclick} {...aAttrs}>
      {children ? Fragment(children) : null}
    </a>
  )
}

export function Redirect(
  attrs: { href: string; status?: number },
  context: Context,
) {
  const href = attrs.href
  if (context.type === 'express') {
    const res = context.res
    if (res.headersSent) {
      res.send(renderRedirect(href))
    } else {
      const status = attrs.status || 303
      res.redirect(status, href)
    }
    throw EarlyTerminate
  }
  if (context.type === 'ws') {
    setSessionUrl(context.ws, attrs.href)
  }
  return (
    <a href={href} data-live="redirect">
      Redirect to {href}
    </a>
  )
}

export function renderRedirect(href: string): string {
  return /* html */ `
<p>Redirect to <a href="${href}">${href}</a></p>
<script>
  location.href = "${href}"
</script>
`
}

export function Switch(routes: Routes, defaultNode?: Node): Node {
  const router = new UrlRouter<Node>()
  Object.entries(routes).forEach(([url, node]) => {
    router.add(url, node)
  })
  return <Router router={router} defaultNode={defaultNode} />
}

export function Router(
  attrs: {
    router: UrlRouter<Node>
    defaultNode?: Node
  },
  _context: Context,
): Node {
  const context = castDynamicContext(_context)
  const match = attrs.router.route(context.url)
  if (!match) return attrs.defaultNode
  context.routerMatch = match
  return match.value
}

export type Routes = {
  [url: string]: Node
}
export type Route = [url: string, node: Node]
