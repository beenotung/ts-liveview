import AppNotice from './pages/app-notice.js'
import AppChat from './pages/app-chat.js'
import AppSettings from './pages/app-settings.js'
import AppMore from './pages/app-more.js'
import { capitalize } from '@beenotung/tslib/string.js'
import { Router } from 'url-router.ts'
import { LayoutType, config, title } from '../config.js'
import { Redirect } from './components/router.js'
import type { Context, DynamicContext } from './context'
import { o } from './jsx/jsx.js'
import type { Node } from './jsx/types'
import About from './pages/about.js'
import AutoCompleteDemo from './pages/auto-complete-demo.js'
import Calculator from './pages/calculator.js'
import UserAgents from './pages/user-agents.js'
import Chatroom from './pages/chatroom.js'
import DemoCookieSession from './pages/demo-cookie-session.js'
import DemoForm from './pages/demo-form.js'
import DemoInputComponents from './pages/demo-inputs.js'
import UserList from './pages/user-list.js'
import Editor from './pages/editor.js'
import Home from './pages/home.js'
import NotFoundPageRoute from './pages/not-found.js'
import Thermostat from './pages/thermostat.js'
import { then } from '@beenotung/tslib/result.js'
import DemoLocale from './pages/demo-locale.js'
import Clock from './pages/clock.js'
import type { MenuRoute } from './components/menu'
import DemoUpload from './pages/demo-upload.js'
import DemoToast from './pages/demo-toast.js'
import appHome from './pages/app-home.js'
import appAbout from './pages/app-about.js'
import appCharacter from './pages/app-character.js'
import type { renderWebTemplate } from '../../template/web.js'
import type { renderIonicTemplate } from '../../template/ionic.js'
import { VNode } from '../../client/jsx/types.js'
import { EarlyTerminate, MessageException } from '../exception.js'
import { renderError } from './components/error.js'

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
  ...AppNotice.routes,
  ...AppChat.routes,
  ...AppSettings.routes,
  ...AppMore.routes,
  ...Home.routes,
  ...About.routes,
  ...Thermostat.routes,
  '/editor': {
    title: title('Image Editor'),
    description:
      'Image Editor that works without javascript, with progress enhancement when javascript and websocket are available',
    menuText: 'Editor',
    node: <Editor />,
  },
  '/auto-complete': {
    title: title('Auto Complete'),
    description: 'Server-driven auto-complete input box demo',
    menuText: 'Auto Complete',
    node: <AutoCompleteDemo />,
  },
  ...DemoForm.routes,
  ...DemoInputComponents.routes,
  ...UserList.routes,
  ...DemoToast.routes,
  ...DemoUpload.routes,
  ...DemoCookieSession.routes,
  ...Chatroom.routes,
  ...DemoLocale.routes,
  '/clock': {
    title: title('Clock'),
    description:
      'Realtime clock using system time localized with client language and timezone',
    menuText: 'Clock',
    node: Clock,
  },
  '/calculator': {
    title: title('Calculator'),
    description: 'A simple stateful component demo',
    menuText: 'Calculator',
    node: <Calculator />,
  },
  '/user-agents': {
    title: title('User Agents of Visitors'),
    description: "User agents of this site's visitors",
    menuText: 'User Agents',
    node: UserAgents,
  },
  ...appHome.routes,
  ...appCharacter.routes,
  ...appAbout.routes,
} satisfies Routes

export let redirectDict: Record<string, string> = {
  '/server/app/pages/thermostat.tsx': '/thermostat',
  '/server/app/pages/editor.tsx': '/editor',
  '/server/app/pages/auto-complete-demo.tsx': '/auto-complete',
  '/server/app/pages/demo-form.tsx': '/form',
  '/server/app/pages/home.tsx': '/',
  '/server/app/app.tsx': '/about/markdown',
  '/server/app/pages/chatroom.tsx': '/chatroom',
}

export const pageRouter = new Router<PageRoute>()

export const menuRoutes: MenuRoute[] = []

Object.entries(routeDict as Routes).forEach(([url, route]) => {
  pageRouter.add(url, { url, ...route })
  if (route.menuText) {
    menuRoutes.push({
      url,
      menuText: route.menuText,
      menuUrl: route.menuUrl || url,
      menuMatchPrefix: route.menuMatchPrefix,
      menuFullNavigate: route.menuFullNavigate,
    })
  }
})

menuRoutes.push({
  url: '/some/page/that/does-not/exist',
  menuText: '404',
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
    return then(route.resolve(context), res => Object.assign(route, res))
  }
  return route
}

export function getContextSearchParams(context: DynamicContext) {
  return new URLSearchParams(
    context.routerMatch?.search || context.url.split('?').pop(),
  )
}

export function errorRoute(
  error: unknown,
  context: Context,
  title: string,
  description: string,
): StaticPageRoute {
  if (error == EarlyTerminate || error instanceof MessageException) {
    throw error
  }
  if (context.type == 'ws' && typeof error == 'string') {
    throw new MessageException([
      'eval',
      // `showToast(${JSON.stringify(error)},'error')`,
      `showAlert(${JSON.stringify(error)},'error')`,
    ])
  }
  return {
    title,
    description,
    node: renderError(error, context),
  }
}

if (config.setup_robots_txt) {
  setTimeout(() => {
    console.log(Object.keys(routeDict).join('\n'))
  }, 1000)
}
