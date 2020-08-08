import { c, Dynamic, h, matchUrlPattern, UrlPatternMatch } from '../lib'
import { render404Page } from '../pages/404-page'
import { renderAboutPage } from '../pages/about-page'
import { renderCalculator } from '../pages/calculator-page'
import { renderEditorPage } from '../pages/editor-page'
import { renderFormPage } from '../pages/form-page'
import { renderServicePage } from '../pages/service-page'
import { renderShopListPage } from '../pages/shop-list-page'
import { renderShopPage } from '../pages/shop-page'
import { route, routes } from '../routes'
import { State } from '../state'
import { renderRainbow } from './rainbow'

const routeMatches: UrlPatternMatch[] = [
  [routes.shop, renderShopPage],
  [routes.service, renderServicePage],
]

function renderPage(state: State): Dynamic {
  const hash = state.hash()
  switch (hash) {
    // matching hard-coded urls
    case '#':
    case '#/':
    case '#/about':
      return renderAboutPage()
    case '#/editor':
      return renderEditorPage(state)
    case '#/form':
      return renderFormPage(state)
    case '#/rainbow':
      return renderRainbow(state)
    // or calculated urls
    case route('Nested Pages'):
      return renderShopListPage()
    case route('Calculator'):
      return renderCalculator(state)
    // or express-style pattern matching, e.g. /shop/:shopId
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
