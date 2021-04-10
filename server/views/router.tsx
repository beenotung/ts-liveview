import express from 'express'
import { loadTemplate } from '../template.js'
import { Fragment, VElementToString, VNodeToString } from '../dom.js'
import { homeView } from './home.js'
import { Style } from '../components.js'
import JSX from '../../client/jsx.js'
import type { VNode } from '../../client/dom'

let template = loadTemplate<{
  title: string
  app: string
}>('index')

export let router = express.Router()

type Page = {
  path: string
  view: VNode
}
let pages: Page[] = [
  { path: 'home', view: homeView },
  { path: 'thermostat', view: homeView },
]

let pagePaths: string[] = []
let pageRecord: Record<string, VNode> = {}
pages.forEach(page => {
  pagePaths.push(page.path)
  pageRecord[page.path] = page.view
})

function Menu({ selected }: { selected: string }) {
  return (
    <Fragment
      list={[
        <Style
          css={`
            .menu > a {
              margin: 0.25em;
              text-decoration: none;
              border-bottom: 1px solid black;
            }
            .menu > a.selected {
              border-bottom: 2px solid black;
            }
          `}
        />,
        <h1>Menu</h1>,
        <div class="menu">
          <Fragment
            list={pagePaths.map(path => {
              let className = path === selected ? 'selected' : ''
              return (
                <a href={path} class={className}>
                  {path}
                </a>
              )
            })}
          />
        </div>,
      ]}
    />
  )
}

function App({ path }: { path: string }) {
  let page = pageRecord[path]
  if (!page) {
    page = `404 Page Not Found - ${path}`
  }
  return (
    <div id="app" class="light live">
      <Menu selected={path} />
      {page}
    </div>
  )
}

router.get('/', (req, res) => {
  res.redirect('/home')
})

router.get('/:page', (req, res, next) => {
  let path = req.params.page
  let html = template({
    title: `${path} - LiveView Demo`,
    app: VElementToString(<App path={path} />),
  })
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Link', `<http://localhost:8100/${path}>; rel="canonical"`)
  res.end(html)
})
