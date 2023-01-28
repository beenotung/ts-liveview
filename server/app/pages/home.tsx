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
