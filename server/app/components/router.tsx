import JSX from '../jsx/jsx.js'
import { getContext } from '../context.js'
import type { Node } from '../jsx/types'
import { Router as UrlRouter } from 'url-router.ts'

export function Switch(routes: Routes, defaultNode?: Node): Node {
  return <Router routes={Object.entries(routes)} defaultNode={defaultNode} />
}

export function Router(attrs: { routes: Route[]; defaultNode?: Node }): Node {
  let router = new UrlRouter<Node>()
  attrs.routes.forEach(([url, node]) => {
    router.add(url, node)
  })
  let context = getContext(attrs)
  let match = router.route(context.url)
  if (!match) return attrs.defaultNode
  context.routerMatch = match
  return match.value
}

export type Routes = {
  [url: string]: Node
}
export type Route = [url: string, node: Node]
