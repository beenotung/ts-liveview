import express from 'express'
import { loadTemplate } from '../template.js'
import { VNodeToString } from '../dom.js'
import { homeView } from './home.js'

let index = loadTemplate('index')

export let router = express.Router()

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  let content = index({
    title: 'LiveView Demo',
    app: VNodeToString(homeView),
  })
  res.end(content)
})

router.get('/thermostat')
