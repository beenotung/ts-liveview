import { o } from '../jsx/jsx.js'
import StatusPage from '../components/status-page.js'
import { PageRoute } from '../routes.js'
import { title } from '../../config.js'
import { isPreferZh } from '../components/locale.js'

let NotFoundPageNode = (
  <StatusPage
    id="not-match"
    title={{
      en: '404 Page Not Found',
      zh: '404 找不到頁面',
    }}
    page="not-found.tsx"
  />
)

let en = {
  title: title('Page Not Found'),
  description:
    "Sorry, we couldn't find the page you're looking for. This might be due to changes in our website. Please check the URL or return to the home page.",
  node: NotFoundPageNode,
}

let zh = {
  title: title('找不到頁面'),
  description:
    '抱歉，我們無法找到您尋找的頁面。這可能是由於我們網站的變更。請檢查網址或返回主頁。',
  node: NotFoundPageNode,
}

let NotFoundPageRoute: PageRoute = {
  status: 404,
  resolve(context) {
    return isPreferZh(context) ? zh : en
  },
}

export default NotFoundPageRoute
