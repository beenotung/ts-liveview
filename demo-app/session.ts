import S from 's-js'
import { Session, useClientMessage } from '../src'
import { renderApp } from './app'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { renderStats } from './components/stats'
import { Calculator } from './pages/calculator-page'
import { renderEditorPage } from './pages/editor-page'
import { inc_counter, session_counter, State } from './state'

export function createSession(session: Session): Session | void {
  inc_counter(session_counter)
  S.root(dispose => {
    session.once('close', dispose)

    const state = new State({ url: session.request.url! })
    S.cleanup(() => state.dispose())

    session.onMessage = useClientMessage(message => {
      if (message.type === 'event') {
        const [type, ...args] = message.args
        state.events.emit(type, args)
        return
      }
      console.log(message)
    })
    // for client request
    state.events.on('resendTemplate', ([selector]: [string]) =>
      session.resendTemplate(selector),
    )

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
    state.events.on(
      'calculator',
      ([name, value]: [keyof Calculator, number]) => {
        state.calculator[name](value)
      },
    )

    session.sendTemplate(renderApp(state))
    const options = { skipInitialSend: true }
    session.live(renderStats, options)
    session.live(renderClock, options)
    session.live(renderMenu, options)
    session.live(() => renderNav(state), options)
    session.live(() => renderEditorPage(state), options)
  })
  return session
}
