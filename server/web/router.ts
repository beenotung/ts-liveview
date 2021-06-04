import express from 'express'
import { Router as UrlRouter } from 'url-router.ts'
import { VNodeToString } from '../dom.js'
import type { OnWsMessage } from '../ws/wss.js'
import type { Context, ContextHandler } from './context.js'
import type { View } from './view.js'

export let expressRouter = express.Router()
export let urlRouter = new UrlRouter<ContextHandler>()

expressRouter.use((req, res, next) => {
  let url = req.url
  let route = urlRouter.route(url)
  if (!route) {
    return next()
  }
  let handler = route.value
  let context: Context = {
    url,
    route: route,
    type: 'express',
    req,
    res,
    next,
  }
  handler(context)
})

export let onWsMessage: OnWsMessage = (event, ws, wss) => {
  let [url, ...rest] = event
  let route = urlRouter.route(url)
  if (!route) {
    console.debug('unknown ws message:', event)
    return
  }
  let handler = route.value
  let context: Context = {
    url,
    route,
    type: 'ws',
    ws,
    wss,
    rest,
  }
  handler(context)
}

import home from './views/home.js'
home(urlRouter)

import thermostat from './views/thermostat.js'
thermostat(urlRouter)
