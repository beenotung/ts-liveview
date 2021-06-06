import JSX from './jsx/jsx.js'
import type { index } from '../../template/index.html'
import { loadTemplate } from '../template.js'
import express from 'express'
import type { ExpressContext, Context } from './context'
import { getUrl } from './context.js'
import type { Node } from './jsx/types'
import { nodeToHTML } from './jsx/html.js'
import { sendHTML } from './express.js'

let template = loadTemplate<index>('index')

export function App(): Node {
  return (
    <div class="app">
      <h1>ts-liveview Demo</h1>
      <p>This page is powered by Server-Side-Rendered JSX Components</p>
      {[Page]}
    </div>
  )
}

export let expressRouter = express.Router()
expressRouter.use((req, res, next) => {
  let context: ExpressContext = {
    type: 'express',
    req,
    res,
    next,
  }
  let html = template({
    title: 'TODO',
    description: 'TODO',
    app: nodeToHTML([App], context),
  })
  sendHTML(res, html)
})

function Page(context: Context) {
  let url = getUrl(context)
  return (
    <div class="page">
      <h2>Page</h2>
      <p>
        url: <code>{url}</code>
      </p>
    </div>
  )
}
