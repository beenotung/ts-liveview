import S from 's-js'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { scripts } from './global/scripts'
import { styles } from './global/styles'
import { c, h, Request, Response, Template } from './lib'
import { State } from './state'

export function initialRender(req: Request, res: Response): string | Template {
  const state = new State({ url: req.url })
  const template = renderApp(state)
  state.dispose()
  return template
}

export function renderApp(state: State) {
  return S.sample(() =>
    c(
      '#app',
      h`<div id="app" class="live">
${styles}
<h1>SSR SPA Demo</h1>
${renderClock()}
${renderMenu()}
${renderNav(state)}
${scripts}
</div>`,
    ),
  )
}
