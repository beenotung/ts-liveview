import { o } from '../jsx/jsx.js'
import StatusPage from '../components/status-page.js'
import { PageRoute } from '../routes.js'
import { Locale, Title } from '../components/locale.js'

let NotFoundPageRoute: PageRoute = {
  status: 404,
  resolve(context) {
    let t = <Locale en="Page Not Found" zh_hk="找不到頁面" zh_cn="找不到页面" />
    let desc = (
      <Locale
        en="Sorry, we couldn't find the page you're looking for. This might be due to changes in our website. Please check the URL or return to the home page."
        zh_hk="抱歉，我們無法找到您尋找的頁面。這可能是由於我們網站的變更。請檢查網址或返回主頁。"
        zh_cn="抱歉，我们无法找到您寻找的页面。这可能是由于我们网站的变更。请检查网址或返回主页。"
      />
    )
    return {
      title: <Title t={t} />,
      description: desc,
      node: (
        <StatusPage
          id="not-match"
          status={404}
          title={t}
          description={desc}
          page="not-found.tsx"
        />
      ),
    }
  },
}

export default NotFoundPageRoute
