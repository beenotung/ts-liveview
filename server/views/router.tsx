import express from 'express'
import { loadTemplate } from '../template.js'
import {
  flagsToClassName,
  Fragment,
  VElementToString,
  VNodeToString,
} from '../dom.js'
import { notImplemented, pageNotFoundView } from './errors.js'
import { homeView } from './home.js'
import { Style } from '../components.js'
import JSX from '../../client/jsx.js'
import type { View } from './view.js'

let template = loadTemplate<{
  title: string
  app: string
}>('index')

export let router = express.Router()

type Page = {
  url: string
  view: View
}
let pages: Page[] = [
  { url: 'home', view: homeView },
  { url: 'thermostat', view: homeView },
]

let pageUrls: string[] = []
let pageRecord: Record<string, View> = {}
pages.forEach(page => {
  pageUrls.push(page.url)
  pageRecord[page.url] = page.view
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
            list={pageUrls.map(url => {
              let className = flagsToClassName({ selected: url === selected })
              return (
                <a href={url} class={className}>
                  {url}
                </a>
              )
            })}
          />
        </div>,
      ]}
    />
  )
}

function App({ url }: { url: string }) {
  let view = pageRecord[url] || pageNotFoundView
  let node = view.initView || view.render?.({ url }) || notImplemented.initView
  return (
    <div id="app" class="light live">
      <Menu selected={url} />
      {node}
    </div>
  )
}

router.get('/', (req, res) => {
  res.redirect('/home')
})

router.get('/:page', (req, res, next) => {
  let page = req.params.page
  let html = template({
    title: `${page} - LiveView Demo`,
    app: VElementToString(<App url={page} />),
  })
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Link', `<http://localhost:8100/${page}>; rel="canonical"`)
  res.end(html)
})
