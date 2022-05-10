import { capitalize } from '@beenotung/tslib/string.js'
import { Router } from 'url-router.ts'
import { RouterContext } from './context.js'
import JSX from './jsx/jsx.js'
import { Node } from './jsx/types'
import About from './pages/about.js'
import AutoCompleteDemo from './pages/auto-complete-demo.js'
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

export type PageRouteMatch = {
  title: string
  node: Node
  description?: string
  menuText?: string
}

export type PageRoute = {
  url: string
} & PageRouteMatch

export const pageRoutes: PageRoute[] = []

function title(page: string) {
  return page + ' | ts-liveview Demo'
}

pageRoutes.push({
  url: '/',
  title: title('Home'),
  // jsx node can be used directly
  node: Home,
})
pageRoutes.push({
  url: '/home',
  title: title('Home'),
  menuText: 'Home',
  node: Home,
})

pageRoutes.push({
  url: '/about',
  title: title('About'),
  menuText: 'About',
  node: About,
})
pageRoutes.push({
  url: '/about/:mode',
  title: title('About'),
  menuText: 'About',
  node: About,
})

pageRoutes.push({
  url: '/thermostat',
  title: title('Thermostat'),
  menuText: 'Thermostat',
  // invoke functional component with square bracket
  node: [Thermostat.index],
})
pageRoutes.push({
  url: '/thermostat/inc',
  title: title('Thermostat'),
  node: [Thermostat.inc],
})
pageRoutes.push({
  url: '/thermostat/dec',
  title: title('Thermostat'),
  node: [Thermostat.dec],
})

pageRoutes.push({
  url: '/editor',
  title: title('Image Editor'),
  menuText: 'Editor',
  // or invoke functional component with x-html tag
  node: <Editor />,
})

pageRoutes.push({
  url: '/auto-complete',
  title: title('Auto Complete'),
  menuText: 'Auto Complete',
  node: <AutoCompleteDemo />,
})

pageRoutes.push({
  url: '/form',
  title: title('Form'),
  menuText: 'Form',
  node: <DemoForm.index />,
})

let routes: Record<string, PageRouteMatch> = {
  '/': {
    title: title('Home'),
    node: Home,
  },
  '/home': {
    title: title('Home'),
    menuText: 'Home',
    node: Home,
  },
  '/about': {
    title: title('About'),
    menuText: 'About',
    node: Home,
  },
  '/about/:mode': {
    title: title('About'),
    menuText: 'About',
    node: Home,
  },
}

export const pageRouter = new Router<PageRoute>()

pageRoutes.forEach(route => {
  pageRouter.add(route.url, route)
})

export function matchRoute(context: RouterContext): PageRouteMatch {
  let match = pageRouter.route(context.url)
  context.routerMatch = match
  return match
    ? match.value
    : {
        title: 'Page Not Found | ts-liveview',
        node: <NotMatch />,
      }
}
