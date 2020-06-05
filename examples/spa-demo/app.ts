import S from 's-js'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { renderStats } from './components/stats'
import { scripts } from './global/scripts'
import { styles } from './global/styles'
import { c, Component, h, Request, Response, sampleView } from './lib'
import { inc_counter, State, visitor_counter } from './state'

export function initialRender(req: Request, res: Response): string | Component {
  inc_counter(visitor_counter)
  return sampleView(() => {
    return renderApp(new State({ url: req.url }))
  })
}

export function renderApp(state: State) {
  const chatroom = 'https://chat.liveviews.xyz'
  return S.sample(() =>
    c(
      '#app',
      h`<div id="app" class="live">
${styles}
<h1>
TS LiveView Demo
<a href="https://news.ycombinator.com/item?id=22917879" style="font-size: 1rem">HN</a>
<a href="https://github.com/beenotung/ts-liveview" style="font-size: 1rem">git</a>
</h1>
${renderStats()}
${renderClock()}
<h2>Chatroom</h2>
<a href="${chatroom}">${chatroom}</a>
${renderMenu()}
${renderNav(state)}
${scripts}
</div>`,
    ),
  )
}
