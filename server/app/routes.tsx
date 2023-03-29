import AppNotice from './pages/app-notice.js'
import AppChat from './pages/app-chat.js'
import AppSettings from './pages/app-settings.js'
import AppMore from './pages/app-more.js'
import Privacy from './pages/privacy.js'
import { capitalize } from '@beenotung/tslib/string.js'
import { Router } from 'url-router.ts'
import { LayoutType, config, title } from '../config.js'
import { Redirect } from './components/router.js'
import UILanguage from './components/ui-language.js'
import type express from 'express'
import type { DynamicContext, ExpressContext } from './context'
import { o } from './jsx/jsx.js'
import type { Node } from './jsx/types'
import UserAgents from './pages/user-agents.js'
import Home from './pages/home.js'
import NotFoundPageRoute from './pages/not-found.js'
import { then } from '@beenotung/tslib/result.js'
import Login from './pages/login.js'
import Register from './pages/register.js'
import type { MenuRoute } from './components/menu'
import DemoPlugin from './pages/demo-plugin.js'
import AppHome from './pages/app-home.js'
import AppAbout from './pages/app-about.js'
import AppCharacter from './pages/app-character.js'
import type { renderWebTemplate } from '../../template/web.js'
import type { renderIonicTemplate } from '../../template/ionic.js'
import { VNode } from '../../client/jsx/types.js'
import { evalAttrsLocale } from './components/locale.js'

let titles: Record<string, string> = {}

export function getTitle(url: string): string {
  let title = titles[url] || capitalize(url.split('/')[1] || 'Home Page')
  return title
}

const StreamingByDefault = true

export type PageRoute = PageRouteOptions & (StaticPageRoute | DynamicPageRoute)

type TemplateFn = typeof renderWebTemplate | typeof renderIonicTemplate

type RenderOptions = {
  layout_type?: LayoutType
  renderTemplate?: TemplateFn
}

export type PageRouteOptions = {
  // streaming is enabled by default
  // HTTP headers cannot be set when streaming
  // If you need to set cookies or apply redirection, you may use an express middleware before the generic app route
  streaming?: boolean
} & Partial<MenuRoute> &
  RenderOptions

export type StaticPageRoute = {
  title: string
  node: Node | VNode
  description: string
  status?: number
} & RenderOptions

export type DynamicPageRoute = {
  resolve: (context: DynamicContext) => ResolvedPageRoute
}
export type ResolvedPageRoute = StaticPageRoute | Promise<StaticPageRoute>

export type PageRouteMatch = PageRouteOptions & StaticPageRoute

export type Routes = Record<string, PageRoute>

// jsx node can be used directly, e.g. `Home`
// invoke functional component with square bracket, e.g. `[Editor]`
// or invoke functional component with x-html tag, e.g. `<Editor/>

// TODO direct support alternative urls instead of having to repeat the entry
let routeDict = {
  ...Home.routes,
  ...DemoPlugin.routes,
  ...UILanguage.routes,
  ...UserAgents.routes,
  ...Login.routes,
  ...Register.routes,
  ...AppHome.routes,
  ...AppCharacter.routes,
  ...AppAbout.routes,
  ...AppChat.routes,
  ...AppNotice.routes,
  ...AppMore.routes,
  ...AppSettings.routes,
  ...Privacy.routes,
} satisfies Routes

export let redirectDict: Record<string, string> = {
  '/server/app/pages/home.tsx': '/',
}

export const pageRouter = new Router<PageRoute>()

export const menuRoutes: MenuRoute[] = []

Object.entries(routeDict as Routes).forEach(([url, route]) => {
  pageRouter.add(url, { url, ...route })
  if (route.menuText) {
    menuRoutes.push({
      ...route,
      url,
      menuText: route.menuText,
      menuUrl: route.menuUrl || url,
      menuMatchPrefix: route.menuMatchPrefix,
      menuFullNavigate: route.menuFullNavigate,
    })
  }
})

Object.entries(redirectDict).forEach(([url, href]) =>
  pageRouter.add(url, {
    url,
    title: title('Redirection Page'),
    description: 'Redirect to ' + url,
    node: <Redirect href={href} />,
    status: 302,
  }),
)

export function matchRoute(
  context: DynamicContext,
): PageRouteMatch | Promise<PageRouteMatch> {
  let match = pageRouter.route(context.url)
  let route: PageRoute = match ? match.value : NotFoundPageRoute
  if (route.streaming === undefined) {
    route.streaming = StreamingByDefault
  }
  context.routerMatch = match
  if ('resolve' in route) {
    return then(route.resolve(context), res => {
      let resolved = Object.assign(route, res)
      evalAttrsLocale(resolved, 'title', context)
      evalAttrsLocale(resolved, 'description', context)
      return resolved
    })
  }
  evalAttrsLocale(route, 'title', context)
  evalAttrsLocale(route, 'description', context)
  return route
}

export function resolveExpressContext(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
    url: req.url,
    routerMatch: pageRouter.route(req.url),
  }
  return context
}

// TODO setup robots.txt
if (config.setup_robots_txt) {
  setTimeout(() => {
    console.log(Object.keys(routeDict).join('\n'))
  }, 1000)
}
