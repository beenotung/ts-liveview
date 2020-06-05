import debug from 'debug'
import S from 's-js'
import { renderApp } from './app'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { renderStats } from './components/stats'
import { sampleInSRoot, Session } from './lib'
import { Calculator } from './pages/calculator-page'
import { renderEditorPage } from './pages/editor-page'
import { inc_counter, session_counter, State } from './state'

const log = debug('app:session')

export function createSession(session: Session): Session | void {
  inc_counter(session_counter)

  log('session.params', session.params)
  const state = new State({ url: session.params.url })

  session.onMessage(args => {
    const [type, ...rest] = args
    state.events.emit(type, rest)
  })

  // for Nav
  state.events.on('hash', ([hash]: [string]) => state.hash(hash))

  // for Home Page
  state.events.on('width', ([width]: [string]) => state.width(+width))
  state.events.on('bg', ([color]: [string]) => state.background(color))

  // for Booking Page
  state.events.on('booking', ([name, value]: [string, string]) => {
    const booking = S.sample(state.booking)
    Object.assign(booking, { [name]: value })
    state.booking(booking)
  })

  // for Calculator Page
  state.events.on('calculator', ([name, value]: [keyof Calculator, number]) => {
    state.calculator[name](value)
  })

  session.sendComponent(sampleInSRoot(() => renderApp(state)))
  const options = { skipInitialSend: true }
  session.live(renderStats, options)
  session.live(renderClock, options)
  session.live(renderMenu, options)
  session.live(() => renderNav(state), options)
  session.live(() => renderEditorPage(state), options)
  return session
}
