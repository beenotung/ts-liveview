import S from 's-js'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { renderStats } from './components/stats'
import { scripts } from './global/scripts'
import { styles } from './global/styles'
import { c, h, Request, Response, Template } from './lib'
import { inc_counter, State, visitor_counter } from './state'

export function initialRender(req: Request, res: Response): string | Template {
  inc_counter(visitor_counter)
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
<h1>
TS LiveView Demo
<a href="https://github.com/beenotung/ts-liveview" style="font-size: 1rem">git</a>
</h1>
${renderStats()}
${renderClock()}
${renderMenu()}
${renderNav(state)}
${scripts}
</div>`,
    ),
  )
}
