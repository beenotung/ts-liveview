import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { Routes } from '../routes.js'
import { title } from '../../config.js'
import Style from '../components/style.js'
import { Locale, isPreferZh } from '../components/locale.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let style = Style(/* css */ `
`)

let content = (
  <div id="home">
    <h1>
      <Locale en="Home Page" zh="首頁" />
    </h1>

    <p>
      <Locale
        en="You can get started by replacing the contents in this page."
        zh="你可以從修改此頁的內容開始。"
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
        zh={
          <>
            當瀏覽器載入此網址時，伺服器會回應完整的 HTML 內容給 GET
            請求，讓瀏覽器能夠盡快完成有意義的頁面渲染 (meaningful paint)，這對
            SEO（搜尋引擎優化）是非常理想的。
          </>
        }
      />
    </p>

    <p>
      <Locale
        en="Try some reactive demos:"
        zh="試試一些反應式 (reactive) 範例:"
      />{' '}
      <a href="https://liveviews.cc/thermostat" target="_blank">
        <Locale en="Thermostat" zh="溫控器" />
      </a>
      ,{' '}
      <a href="https://liveviews.cc/form" target="_blank">
        <Locale en="Form Demo" zh="表單範例" />
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
let content_en = prerender(home, { language: 'en' })
let content_zh = prerender(home, { language: 'zh' })

let routes = {
  '/': {
    menuText: <Locale en="Home" zh="主頁" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '首頁' : 'Home'),
        description: zh
          ? '開始使用 ts-liveview - 一個具有漸進增強功能的伺服器端渲染即時網頁應用框架'
          : 'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
        node: zh ? content_zh : content_en,
      }
    },
  },
} satisfies Routes

export default { routes }
