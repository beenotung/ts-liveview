import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { c, h, Request, Response, sampleTemplate, Template } from './lib'
import { State } from './state'

export function initialRender(req: Request, res: Response): string | Template {
  const state = new State({ url: req.url })
  const template = renderApp(state)
  state.dispose()
  return template
}

export function renderApp(state: State) {
  return c(
    '#app',
    h`<div id="app" class="live">
<h1>SSR SPA Demo</h1>
${sampleTemplate(renderClock)}
${sampleTemplate(renderMenu)}
${sampleTemplate(() => renderNav(state))}
</div>`,
  )
}
