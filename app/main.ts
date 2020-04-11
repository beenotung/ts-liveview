import S from 's-js'
import { initialRender, renderApp } from './app'
import { renderClock } from './components/clock'
import { renderMenu } from './components/menu'
import { renderNav } from './components/nav'
import { Session, startServer, useClientMessage } from './lib'
import { State } from './state'

function createSession(session: Session): Session | void {
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
    state.events.on('resendTemplate', ([selector]: [string]) =>
      session.resendTemplate(selector),
    )
    state.events.on('hash', ([hash]: [string]) => state.hash(hash))
    state.events.on('booking', ([name, value]: [string, string]) => {
      const booking = S.sample(state.booking)
      Object.assign(booking, { [name]: value })
      state.booking(booking)
    })

    session.sendTemplate(renderApp(state))
    const options = { skipInitialSend: true }
    session.live(renderClock, options)
    session.live(renderMenu, options)
    session.live(() => renderNav(state), options)
  })
  return session
}

startServer({
  port: 3333,
  title: 'TS LiveView Demo',
  heads: [
    `
  <meta name="description" content="server-side rendered reactive single-page app">
  <meta http-equiv="x-ua-compatible" content="IE=Edge">
`,
  ],
  createSession,
  initialRender,
})
