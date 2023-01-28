import { Link } from '../components/router.js'
import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { ResolvedPageRoute, Routes } from '../routes.js'
import { title } from '../../config.js'
import Style from '../components/style.js'
import { Locale, LocaleVariants } from '../components/locale.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let style = Style(/* css */ `
`)

let content = (
  <div id="home">
    <h1>
      <Locale en="Home" zh_hk="主頁" zh_cn="主页" />
    </h1>

    <p>
      <Locale
        en="You can get started by replacing the contents in this page."
        zh_hk="你可以從修改此頁的內容開始。"
        zh_cn="你可以从修改此页的内容开始。"
      />
    </p>

    <p>
      <Locale
        en={
          <>
            When the browser loads this URL, the server responds with complete
            HTML content to the GET request. This allows the browser to perform
            meaningful paint as soon as possible, which is ideal for SEO.
          </>
        }
        zh_hk={
          <>
            當瀏覽器載入此網址時，伺服器會回應完整的 HTML 內容給 GET
            請求，讓瀏覽器能夠盡快完成有意義的頁面渲染 (meaningful paint)，這對
            SEO（搜尋引擎優化）是非常理想的。
          </>
        }
        zh_cn={
          <>
            当浏览器载入此网址时，服务器会响应完整的 HTML 内容给 GET
            请求，让浏览器能够尽快完成有意义的页面渲染（meaningful paint），这对
            SEO（搜索引擎优化）是非常理想的。
          </>
        }
      />
    </p>

    <p>
      <Locale
        en="Try some reactive demos:"
        zh_hk="試試一些反應式 (reactive) 範例:"
        zh_cn="试试一些反应式 (reactive) 示例:"
      />{' '}
      <a href="https://liveviews.cc/thermostat" target="_blank">
        <Locale en="Thermostat" zh_hk="溫控器" zh_cn="温控器" />
      </a>
      ,{' '}
      <a href="https://liveviews.cc/form" target="_blank">
        <Locale en="Form Demo" zh_hk="表單範例" zh_cn="表单示例" />
      </a>
    </p>

    <h2>
      <Locale en="Privacy Policy" zh_hk="私隱政策" zh_cn="隐私政策" />
    </h2>

    <p>
      <Locale
        en="This website collects geolocation data (country and city level) and browser information for analytics purposes. Exact IP addresses are not stored. We honor the Do Not Track (DNT) browser preference - when enabled, geolocation and user agent data collection is automatically disabled for your visits."
        zh_hk="本網站會收集地理位置數據（國家和城市級別）和瀏覽器資訊，用於分析目的。精確的 IP 地址不會被存儲。我們尊重「請勿追蹤」(DNT) 瀏覽器偏好設定 - 啟用後，我們會自動停止為您的訪問收集地理位置數據和用戶代理資訊。"
        zh_cn="本网站会收集地理位置数据（国家和城市级别）和浏览器信息，用于分析目的。精确的 IP 地址不会被存储。我们尊重「请勿追踪」(DNT) 浏览器偏好设置 - 启用后，我们会自动停止为您的访问收集地理位置数据和用户代理信息。"
      />
    </p>
    <Link href="/privacy">
      <Locale
        en="Learn more about our privacy policy."
        zh_hk="了解更多關於我們的私隱政策。"
        zh_cn="了解更多关于我们的隐私政策。"
      />
    </Link>

    <SourceCode page="home.tsx" />
  </div>
)

let home = (
  <>
    {style}
    {content}
  </>
)

// And it can be pre-rendered into html as well
//
// This route is optimized for static content,
// you can reference other pages for routes with dynamic content
// using <Title> and <Locale> in route title and description
let route: LocaleVariants<ResolvedPageRoute> = {
  en: {
    title: title('Home'),
    description:
      'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    node: prerender(home, { language: 'en' }),
  },
  zh_hk: {
    title: title('主頁'),
    description:
      '開始使用 ts-liveview - 一個具有漸進增強功能的伺服器端渲染即時網頁應用框架',
    node: prerender(home, { language: 'zh_hk' }),
  },
  zh_cn: {
    title: title('主页'),
    description:
      '开始使用 ts-liveview - 一个具有渐进增强功能的服务器端渲染即时网页应用框架',
    node: prerender(home, { language: 'zh_cn' }),
  },
}

let routes = {
  '/': {
    menuText: <Locale en="Home" zh_hk="主頁" zh_cn="主页" />,
    resolve(context) {
      return Locale(route, context)
    },
  },
} satisfies Routes

export default { routes }
