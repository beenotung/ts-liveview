import { Link } from '../components/router.js'
import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import Comment from '../components/comment.js'
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
        zh_hk={
          <>
            這個網站是一個{' '}
            <b>
              混合 <abbr title="靜態生成">SSG</abbr> 和{' '}
              <abbr title="伺服器端渲染">SSR</abbr> 的即時網頁應用
            </b>{' '}
            （亦稱為 <b>SSR-SPA</b>）。
          </>
        }
        zh_cn={
          <>
            这个网站是一个{' '}
            <b>
              混合 <abbr title="静态生成">SSG</abbr> 和{' '}
              <abbr title="服务器端渲染">SSR</abbr> 的即时网页应用
            </b>{' '}
            （亦称为 <b>SSR-SPA</b>）。
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
        en="Then the browser establishes a websocket connection to receive real-time updates from the server."
        zh_hk="然後，瀏覽器會建立 websocket 連接，以便接收伺服器的即時更新。"
        zh_cn="然后，浏览器会建立 websocket 连接，以便接收服务器的即时更新。"
      />
    </p>

    <p>
      <Locale
        en="The app logic is executed on the server, and the app state is kept on the server. (The input values are kept in the DOM before form submission.)"
        zh_hk="應用邏輯在伺服器上執行，應用狀態也保持在伺服器上。（輸入值在表單提交前保存在 DOM 中。）"
        zh_cn="应用逻辑在服务器上执行，应用状态也保持在服务器上。（输入值在表单提交前保存在 DOM 中。）"
      />
    </p>

    <p>
      <Locale
        en="Unlike ts-liveview v1, the server does not maintain a virtual DOM for diff-patch."
        zh_hk="與 ts-liveview v1 不同，伺服器並不維持虛擬 DOM (virtual DOM) 進行差異修補。"
        zh_cn="与 ts-liveview v1 不同，服务器并不维护虚拟 DOM (virtual DOM) 进行差异修补。"
      />{' '}
      <Locale
        en="The UI is updated using query selectors and AST/JSX."
        zh_hk="介面是通過查詢選擇器 (query selectors) 和 AST/JSX 進行更新的。"
        zh_cn="介面是通过查询选择器 (query selectors) 和 AST/JSX 进行更新的。"
      />{' '}
      <Locale
        en="ts-liveview employs a hybrid approach: the developer can specify the initial layout declaratively and apply event-driven partial layout updates."
        zh_hk="ts-liveview 採用了混合方式：開發者可以聲明式地指定初始佈局 (declarative UI) ，並應用事件驅動 (event driven) 的部分佈局更新 (partial update)。"
        zh_cn="ts-liveview 采用了混合方式：开发者可以声明式地指定初始布局 (declarative UI)，并应用事件驱动的部分布局更新 (partial update)。"
      />{' '}
      <Locale
        en="This is like a crossover of"
        zh_hk="這就像是"
        zh_cn="这就像是"
      />{' '}
      <a href="https://reactjs.org/" target="_blank">
        React
      </a>{' '}
      <Locale en="and" zh_hk="和" zh_cn="和" />{' '}
      <a href="https://jquery.com/" target="_blank">
        jQuery
      </a>{' '}
      <Locale
        en=", taking the best of both worlds, balancing developer experience (DX) and runtime efficiency, which improves user experience (UX)."
        zh_hk="的結合，取兩者的優點，平衡開發者體驗（DX）和運行時效能，從而提升用戶體驗（UX）。"
        zh_cn="的结合，取两者的优点，平衡开发者体验（DX）和运行时效能，从而提升用户体验（UX）。"
      />
    </p>

    <h2>
      <Locale
        en="ts-liveview code snippet"
        zh_hk="ts-liveview 程式碼範例"
        zh_cn="ts-liveview 代码示例"
      />
    </h2>

    <p>
      <Locale
        en="You can either write in JSX or AST."
        zh_hk="您可以使用 JSX 或 AST 編寫。"
        zh_cn="您可以使用 JSX 或 AST 编写。"
      />
    </p>

    {Comment(
      <Locale
        en="using table to align 3 code blocks with the same width"
        zh_hk="使用表格將三個程式碼塊對齊至相同寬度"
        zh_cn="使用表格将三个代码块对齐至相同宽度"
      />,
    )}

    <table>
      <tbody>
        <tr>
          <td>
            <fieldset>
              <legend>
                <Locale en="JSX Example" zh_hk="JSX 範例" zh_cn="JSX 示例" />
              </legend>
              <code class="inline-code">{`<a href='#'>hash link</a>`}</code>
            </fieldset>
          </td>
        </tr>

        <tr>
          <td>
            <fieldset>
              <legend>
                <Locale en="AST Example" zh_hk="AST 範例" zh_cn="AST 示例" />
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
                <Locale en="HTML output" zh_hk="HTML 輸出" zh_cn="HTML 输出" />
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
        zh_hk="試試一些反應式 (reactive) 範例:"
        zh_cn="试试一些反应式 (reactive) 示例:"
      />{' '}
      <Link href="/thermostat">
        <Locale en="Thermostat" zh_hk="溫控器" zh_cn="温控器" />
      </Link>
      {', '}
      <Link href="/form">
        <Locale en="Form Demo" zh_hk="表單範例" zh_cn="表单示例" />
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
