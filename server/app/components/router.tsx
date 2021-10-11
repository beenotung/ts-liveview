import JSX from '../jsx/jsx.js'
import { getContext, getRouterContext } from '../context.js'
import type { Node } from '../jsx/types'
import { Router as UrlRouter } from 'url-router.ts'
import { Fragment } from './fragment.js'
import { EarlyTerminate } from '../helpers.js'
import { setSessionUrl } from '../session.js'

export type LinkAttrs = {
  'no-history'?: boolean
  'href': string
  'onclick'?: never
  [name: string]: any
}

export function Link(attrs: LinkAttrs, children?: any[]) {
  const { 'no-history': quiet, ...aAttrs } = attrs
  const onclick = quiet ? `emitHref(event,'q')` : `emitHref(event)`
  if (!children) {
    console.warn(new Error('Link with empty content'))
  }
  return (
    <a onclick={onclick} {...aAttrs}>
      {children ? Fragment(children) : null}
    </a>
  )
}

export function Redirect(attrs: { href: string; status?: number }) {
  const href = attrs.href
  const context = getContext(attrs)
  if (context.type === 'express') {
    const status = attrs.status || 303
    context.res.redirect(status, href)
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

export function Switch(routes: Routes, defaultNode?: Node): Node {
  const router = new UrlRouter<Node>()
  Object.entries(routes).forEach(([url, node]) => {
    router.add(url, node)
  })
  return <Router router={router} defaultNode={defaultNode} />
}

export function Router(attrs: {
  router: UrlRouter<Node>
  defaultNode?: Node
}): Node {
  const context = getRouterContext(attrs)
  const match = attrs.router.route(context.url)
  if (!match) return attrs.defaultNode
  context.routerMatch = match
  return match.value
}

export type Routes = {
  [url: string]: Node
}
export type Route = [url: string, node: Node]
