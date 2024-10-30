import AppNotice from './pages/app-notice.js'
import AppChat from './pages/app-chat.js'
import AppSettings from './pages/app-settings.js'
import AppMore from './pages/app-more.js'
import { capitalize } from '@beenotung/tslib/string.js'
import { Router } from 'url-router.ts'
import { LayoutType, config, title } from '../config.js'
import { Redirect } from './components/router.js'
import UILanguage from './components/ui-language.js'
import type express from 'express'
import type { Context, DynamicContext, ExpressContext } from './context'
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
import AppHome from './pages/app-home.js'
import AppAbout from './pages/app-about.js'
import AppCharacter from './pages/app-character.js'
import type { renderWebTemplate } from '../../template/web.js'
import type { renderIonicTemplate } from '../../template/ionic.js'
import { VNode } from '../../client/jsx/types.js'
import { EarlyTerminate, MessageException } from '../exception.js'
import { renderError } from './components/error.js'
import { Locale, isPreferZh } from './components/locale.js'

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
  ...About.routes,
  ...Thermostat.routes,
  '/editor': {
    menuText: <Locale en="Editor" zh="編輯器" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '圖片編輯器' : 'Image Editor'),
        description: zh
          ? '不依賴 JavaScript 的圖片編輯器，當支援 JavaScript 和 WebSocket 時會提供增強功能'
          : 'Image Editor that works without JavaScript, with progressive enhancement when JavaScript and WebSocket are available',
        node: <Editor />,
      }
    },
  },
  '/auto-complete': {
    menuText: <Locale en="Auto Complete" zh="自動輸入框" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '自動完成' : 'Auto Complete'),
        description: zh
          ? '伺服器驅動的自動完成輸入框範例'
          : 'Server-driven auto-complete input box demo',
        node: <AutoCompleteDemo />,
      }
    },
  },
  ...DemoForm.routes,
  ...DemoInputComponents.routes,
  ...UserList.routes,
  ...DemoToast.routes,
  ...DemoUpload.routes,
  ...DemoCookieSession.routes,
  ...Chatroom.routes,
  ...DemoLocale.routes,
  ...UILanguage.routes,
  '/clock': {
    menuText: <Locale en="Clock" zh="時鐘" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '時鐘' : 'Clock'),
        description: zh
          ? '使用系統時間的即時時鐘，根據客戶端的語言和時區本地化'
          : 'Realtime clock using system time localized with client language and timezone',
        node: Clock,
      }
    },
  },
  '/calculator': {
    menuText: <Locale en="Calculator" zh="計算器" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '計算器' : 'Calculator'),
        description: zh
          ? '一個簡單的有狀態元件範例'
          : 'A simple stateful component demo',
        node: <Calculator />,
      }
    },
  },
  '/user-agents': {
    menuText: <Locale en="Visitor Stats" zh="訪客統計" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '訪客的用戶代理' : 'User Agents of Visitors'),
        description: zh
          ? '此網站訪客的用戶代理資訊'
          : "User agents of this site's visitors",
        node: UserAgents,
      }
    },
  },
  ...AppHome.routes,
  ...AppCharacter.routes,
  ...AppAbout.routes,
  ...AppChat.routes,
  ...AppNotice.routes,
  ...AppMore.routes,
  ...AppSettings.routes,
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
