import type { Router } from 'url-router.ts'
import JSX from '../../../client/jsx.js'
import type { ContextHandler } from '../context.js'
import { sendVElement } from '../helpers/response.js'

function render() {
  return (
    <main>
      <h2>Home Page</h2>
      <a href="/thermostat">Thermostat</a>
    </main>
  )
}

export default function (router: Router<ContextHandler>) {
  router.add('/', context => {
    sendVElement(context, render())
  })
}
