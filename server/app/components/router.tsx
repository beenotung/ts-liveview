import JSX from '../jsx/jsx.js'
import { getContext, getRouterContext } from '../context.js'
import type { Node } from '../jsx/types'
import { Router as UrlRouter } from 'url-router.ts'
import { Fragment } from './fragment.js'
import { EarlyTerminate } from '../helpers.js'

export type LinkAttrs = {
  'no-history'?: boolean
  'href': string
  'onclick'?: never
  [name: string]: any
}

export function Link(attrs: LinkAttrs, children?: any[]) {
  const { 'no-history': quiet, ...aAttrs } = attrs
  const onclick = quiet ? `emitHref(this,'q')` : `emitHref(this)`
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
  return (
    <a href={href} data-live="redirect">
      Redirect to {href}
    </a>
  )
}

export function Switch(routes: Routes, defaultNode?: Node): Node {
  return <Router routes={Object.entries(routes)} defaultNode={defaultNode} />
}

export function Router(attrs: { routes: Route[]; defaultNode?: Node }): Node {
  const router = new UrlRouter<Node>()
  attrs.routes.forEach(([url, node]) => {
    router.add(url, node)
  })
  const context = getRouterContext(attrs)
  const match = router.route(context.url)
  if (!match) return attrs.defaultNode
  context.routerMatch = match
  return match.value
}

export type Routes = {
  [url: string]: Node
}
export type Route = [url: string, node: Node]
