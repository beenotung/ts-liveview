import { c, h } from '../lib'
import { render404Page } from '../pages/404-page'
import { renderBookingPage } from '../pages/booking-page'
import { renderHomePage } from '../pages/home-page'
import { State } from '../state'

function renderPage(state: State) {
  const hash = state.hash()
  switch (hash) {
    case '#/':
    case '#/home':
      return renderHomePage(state)
    case '#/booking':
      return renderBookingPage(state)
    default:
      return render404Page(hash)
  }
}

export function renderNav(state: State) {
  return c(
    '#nav',
    h`<div id="nav">
${renderPage(state)}
</div>`,
  )
}
