import { c, h, matchUrlPattern, UrlPatternMatch } from '../lib'
import { render404Page } from '../pages/404-page'
import { renderBookingPage } from '../pages/booking-page'
import { renderCalculator } from '../pages/calculator-page'
import { renderHomePage } from '../pages/home-page'
import { renderServicePage } from '../pages/service-page'
import { renderShopListPage } from '../pages/shop-list-page'
import { renderShopPage } from '../pages/shop-page'
import { route, routes } from '../routes'
import { State } from '../state'

const routeMatches: UrlPatternMatch[] = [
  [routes.shop, renderShopPage],
  [routes.service, renderServicePage],
]

function renderPage(state: State) {
  const hash = state.hash()
  switch (hash) {
    case '#/':
    case '#/home':
      return renderHomePage(state)
    case '#/booking':
      return renderBookingPage(state)
    case '#/shoplist':
      return renderShopListPage()
    case route('Investment Calculator'):
      return renderCalculator(state)
    default: {
      const url = hash.replace('#', '')
      const page = matchUrlPattern(routeMatches, url)
      if (page !== undefined) {
        return page
      }
      return render404Page(hash)
    }
  }
}

export function renderNav(state: State) {
  return c(
    '#nav',
    h`<div id="nav">
<input type="button" onclick="history.back()" value="Back">
${renderPage(state)}
</div>`,
  )
}
