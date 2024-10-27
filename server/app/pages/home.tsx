import { Link } from '../components/router.js'
import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import Comment from '../components/comment.js'
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
        en={
          <>
            This website is a{' '}
            <b>
              hybrid <abbr title="Static Side Generation">SSG</abbr> and{' '}
              <abbr title="Server-Side Rendered">SSR</abbr> Realtime Web App
            </b>{' '}
            (also known as <b>SSR-SPA</b>).
          </>
        }
        zh={
          <>
            這個網站是一個{' '}
            <b>
              混合 <abbr title="靜態生成">SSG</abbr> 和{' '}
              <abbr title="伺服器端渲染">SSR</abbr> 的即時網頁應用
            </b>{' '}
            （亦稱為 <b>SSR-SPA</b>）。
          </>
        }
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
        en="Then the browser establishes a websocket connection to receive real-time updates from the server."
        zh="然後，瀏覽器會建立 websocket 連接，以便接收伺服器的即時更新。"
      />
    </p>

    <p>
      <Locale
        en="The app logic is executed on the server, and the app state is kept on the server. (The input values are kept in the DOM before form submission.)"
        zh="應用邏輯在伺服器上執行，應用狀態也保持在伺服器上。（輸入值在表單提交前保存在 DOM 中。）"
      />
    </p>

    <p>
      <Locale
        en="Unlike ts-liveview v1, the server does not maintain a virtual DOM for diff-patch."
        zh="與 ts-liveview v1 不同，伺服器並不維持虛擬 DOM (virtual DOM) 進行差異修補。"
      />{' '}
      <Locale
        en="The UI is updated using query selectors and AST/JSX."
        zh="UI 是通過查詢選擇器 (query selectors) 和 AST/JSX 進行更新的。"
      />{' '}
      <Locale
        en="ts-liveview employs a hybrid approach: the developer can specify the initial layout declaratively and apply event-driven partial layout updates."
        zh="ts-liveview 採用了混合方式：開發者可以聲明式地指定初始佈局 (declarative UI) ，並應用事件驅動 (event driven) 的部分佈局更新 (partial update)。"
      />{' '}
      <Locale en="This is like a crossover of" zh="這就像是" />{' '}
      <a href="https://reactjs.org/" target="_blank">
        React
      </a>{' '}
      <Locale en="and" zh="和" />{' '}
      <a href="https://jquery.com/" target="_blank">
        jQuery
      </a>{' '}
      <Locale
        en=", taking the best of both worlds, balancing developer experience (DX) and runtime efficiency, which improves user experience (UX)."
        zh="的結合，取兩者的優點，平衡開發者體驗（DX）和運行時效能，從而提升用戶體驗（UX）。"
      />
    </p>

    <h2>
      <Locale en="ts-liveview code snippet" zh="ts-liveview 程式碼範例" />
    </h2>

    <p>
      <Locale
        en="You can either write in JSX or AST."
        zh="您可以使用 JSX 或 AST 編寫。"
      />
    </p>

    {Comment(
      <Locale
        en="using table to align 3 code blocks with the same width"
        zh="使用表格將三個程式碼塊對齊至相同寬度"
      />,
    )}

    <table>
      <tbody>
        <tr>
          <td>
            <fieldset>
              <legend>
                <Locale en="JSX Example" zh="JSX 範例" />
              </legend>
              <code class="inline-code">{`<a href='#'>hash link</a>`}</code>
            </fieldset>
          </td>
        </tr>

        <tr>
          <td>
            <fieldset>
              <legend>
                <Locale en="AST Example" zh="AST 範例" />
              </legend>
              <code class="inline-code">
                {`['a', { href: '#' }, ['hash link']]`}
              </code>
            </fieldset>
          </td>
        </tr>

        <tr>
          <td>
            <fieldset>
              <legend>
                <Locale en="HTML output" zh="HTML 輸出" />
              </legend>
              <a href="#">hash link</a>
            </fieldset>
          </td>
        </tr>
      </tbody>
    </table>

    <p>
      <Locale
        en="Try some reactive demos:"
        zh="試試一些反應式 (reactive) 範例:"
      />{' '}
      <Link href="/thermostat">
        <Locale en="Thermostat" zh="溫控器" />
      </Link>
      {', '}
      <Link href="/form">
        <Locale en="Form Demo" zh="表單範例" />
      </Link>
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
