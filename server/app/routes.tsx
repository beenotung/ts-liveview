import { capitalize } from '@beenotung/tslib/string.js'
import { Router } from 'url-router.ts'
import { config } from '../config.js'
import { Redirect } from './components/router.js'
import { RouterContext } from './context.js'
import JSX from './jsx/jsx.js'
import type { Node } from './jsx/types'
import About, { License } from './pages/about.js'
import AutoCompleteDemo from './pages/auto-complete-demo.js'
import Calculator from './pages/calculator.js'
import UserAgents from './pages/user-agents.js'
import Chatroom from './pages/chatroom.js'
import DemoCookieSession from './pages/demo-cookie-session.js'
import DemoForm from './pages/demo-form.js'
import Editor from './pages/editor.js'
import Home from './pages/home.js'
import NotMatch from './pages/not-match.js'
import Thermostat from './pages/thermostat.js'

let titles: Record<string, string> = {}

export function getTitle(url: string): string {
  let title = titles[url] || capitalize(url.split('/')[1] || 'Home Page')
  return title
}

const StreamingByDefault = true

export type PageRouteMatch = {
  title?: string
  node: Node
  description?: string
  // streaming is enabled by default
  // HTTP headers cannot be set  when streaming
  // If you need to set cookies or apply redirection, you may use an express middleware before the generic app route
  streaming?: boolean
} & Partial<MenuRoute>

export type MenuRoute = {
  url: string
  menuText: string
  menuUrl: string // optional, default to be same as PageRoute.url
}

export type PageRoute = {
  url: string
} & PageRouteMatch

function title(page: string) {
  return page + ' | ' + config.site_name
}

// jsx node can be used directly, e.g. `Home`
// invoke functional component with square bracket, e.g. `[Editor]`
// or invoke functional component with x-html tag, e.g. `<Editor/>

// TODO direct support alternative urls instead of having to repeat the entry
let routeDict: Record<string, PageRouteMatch> = {
  '/': {
    title: title('Home'),
    description:
      'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    menuText: 'Home',
    menuUrl: '/home',
    node: Home,
  },
  '/home': {
    title: title('Home'),
    description:
      'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    node: Home,
  },
  '/about/:mode?': {
    title: title('About'),
    description:
      'About ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    menuText: 'About',
    menuUrl: '/about',
    node: About,
    streaming: true,
  },
  '/thermostat': {
    title: title('Thermostat'),
    description: 'A realtime updated thermostat demo application',
    menuText: 'Thermostat',
    node: [Thermostat.index],
  },
  '/thermostat/inc': {
    title: title('Thermostat'),
    node: [Thermostat.inc],
  },
  '/thermostat/dec': {
    title: title('Thermostat'),
    node: [Thermostat.dec],
  },
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
  '/form': {
    title: title('Form'),
    description: 'Demonstrate form handling with ts-liveview',
    menuText: 'Form',
    node: <DemoForm.index />,
  },
  '/form/submit': {
    title: title('Form Submission'),
    node: <DemoForm.submit />,
  },
  '/form/live/:key': { node: <DemoForm.set /> },
  '/cookie-session': {
    title: title('Cookie-based Session'),
    description: 'Demonstrate accessing cookie with ts-liveview',
    menuText: 'Cookie Session',
    node: <DemoCookieSession.index />,
  },
  '/cookie-session/token': {
    title: title('Token in Session'),
    node: <DemoCookieSession.index />,
  },
  '/chatroom': {
    title: title('Chatroom'),
    description: 'Live chatroom with realtime-update powered by websocket',
    menuText: 'Chatroom',
    node: <Chatroom.index />,
  },
  '/chatroom/typing': { node: <Chatroom.typing /> },
  '/chatroom/rename': { node: <Chatroom.rename /> },
  '/chatroom/send': { node: <Chatroom.send /> },
  '/calculator': {
    title: title('Calculator'),
    description: 'A simple stateful component demo',
    menuText: 'Calculator',
    node: <Calculator />,
  },
  '/user-agents': {
    title: 'User Agents of Visitors',
    description: "User agents of this site's visitors",
    menuText: 'User Agents',
    node: UserAgents,
  },
  '/LICENSE': {
    title: 'BSD 2-Clause License of ts-liveview',
    description:
      'ts-liveview is a free open source project licensed under the BSD 2-Clause License',
    node: License,
  },
}

export let redirectDict: Record<string, string> = {
  '/server/app/pages/thermostat.tsx': '/thermostat',
  '/server/app/pages/editor.tsx': '/editor',
  '/server/app/pages/auto-complete-demo.tsx': '/auto-complete',
  '/server/app/pages/demo-form.tsx': '/form',
  '/server/app/pages/home.tsx': '/home',
  '/server/app/app.tsx': '/about/markdown',
  '/server/app/pages/chatroom.tsx': '/chatroom',
}

export const pageRouter = new Router<PageRoute>()

export const menuRoutes: MenuRoute[] = []

Object.entries(routeDict).forEach(([url, route]) => {
  pageRouter.add(url, { url, ...route })
  if (route.menuText) {
    menuRoutes.push({
      url,
      menuText: route.menuText,
      menuUrl: route.menuUrl || url,
    })
  }
})

Object.entries(redirectDict).forEach(([url, href]) =>
  pageRouter.add(url, { url, node: <Redirect href={href} /> }),
)

export function matchRoute(context: RouterContext): PageRouteMatch {
  let match = pageRouter.route(context.url)
  if (match && match.value.streaming === undefined) {
    match.value.streaming = StreamingByDefault
  }
  context.routerMatch = match
  return match
    ? match.value
    : {
        title: title('Page Not Found'),
        node: NotMatch,
        streaming: StreamingByDefault,
      }
}
