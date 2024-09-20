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

// And it can be pre-rendered into html as well
let content_en = (
  <div id="home">
    <h1>Home Page</h1>
    <p>
      This website is a{' '}
      <b>
        hybrid <abbr title="Static Side Generation">SSG</abbr> and{' '}
        <abbr title="Server-Side Rendered">SSR</abbr> Realtime Web App
      </b>{' '}
      (also known as <b>SSR-SPA</b>).
    </p>
    <p>
      When the browser load this url, the server responses complete html content
      to the GET request. This allows the browser to perform meaningful paint as
      soon as possible. And it's ideal for SEO.
    </p>
    <p>
      Then the browser establishes websocket connection to receive realtime
      update from the server.
    </p>
    <p>
      The app logic is executed on the server, and the app state is kept on the
      server. (The input values are kept in the DOM before form submission.)
    </p>
    <p>
      As opposite to ts-liveview v1, the server does not maintain virtual dom
      for diff-patch. The UI is updated using query selector and AST/JSX.
      ts-liveview employs hybrid approach: the developer can specify the initial
      layout declaratively and applying event-driven partial layout update. This
      is like a crossover of <a href="https://reactjs.org/">React</a> and{' '}
      <a href="https://jquery.com/">jQuery</a>, taking a good-side of both
      worlds, balancing the developer experience (DX) and runtime efficient,
      which improve the user-experience (UX).
    </p>

    <h2>ts-liveview code snippet</h2>
    <p>You can either write in JSX or AST.</p>
    {Comment(`using table to align 3 code blocks with the same width`)}
    <table>
      <tbody>
        <tr>
          <td>
            <fieldset>
              <legend>JSX Example</legend>
              <code class="inline-code">{`<a href='#'>hash link</a>`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>AST Example</legend>
              <code class="inline-code">{`['a', { href: '#' }, ['hash link']]`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>HTML output</legend>
              <a href="#">hash link</a>
            </fieldset>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      Try some reactive demo: <Link href="/thermostat">Thermostat</Link>,{' '}
      <Link href="/form">Form Demo</Link>
    </p>
    <SourceCode page="home.tsx" />
  </div>
)

let content_zh = (
  <div id="home">
    <h1>首頁</h1>
    <p>
      這個網站是一個{' '}
      <b>
        混合 <abbr title="靜態生成">SSG</abbr> 和{' '}
        <abbr title="伺服器端渲染">SSR</abbr> 的即時網頁應用
      </b>{' '}
      （亦稱為 <b>SSR-SPA</b>）。
    </p>
    <p>
      當瀏覽器載入這個網址時，伺服器會回應完整的 HTML 內容至 GET
      請求。這讓瀏覽器能夠盡快進行有意義的頁面渲染。這對 SEO 是理想的方案。
    </p>
    <p>然後，瀏覽器會建立 websocket 連接，以便接收伺服器的即時更新。</p>
    <p>
      應用邏輯在伺服器上執行，應用狀態也保持在伺服器上。（輸入值在表單提交前保存在
      DOM 中。）
    </p>
    <p>
      與 ts-liveview v1 相反，伺服器並不維持虛擬 DOM 進行差異修補。UI
      是通過查詢選擇器和 AST/JSX 進行更新的。ts-liveview
      採用了混合方式：開發者可以聲明式地指定初始佈局，並應用事件驅動的部分佈局更新。這就像是{' '}
      <a href="https://reactjs.org/">React</a> 和{' '}
      <a href="https://jquery.com/">jQuery</a>{' '}
      的結合，取兩者的優點，平衡開發者體驗（DX）和運行時效能，從而提升用戶體驗（UX）。
    </p>

    <h2>ts-liveview 程式碼範例</h2>
    <p>您可以使用 JSX 或 AST 編寫。</p>
    {Comment(`使用表格將三個程式碼塊對齊至相同寬度`)}
    <table>
      <tbody>
        <tr>
          <td>
            <fieldset>
              <legend>JSX 範例</legend>
              <code class="inline-code">{`<a href='#'>hash link</a>`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>AST 範例</legend>
              <code class="inline-code">{`['a', { href: '#' }, ['hash link']]`}</code>
            </fieldset>
          </td>
        </tr>
        <tr>
          <td>
            <fieldset>
              <legend>HTML 輸出</legend>
              <a href="#">hash link</a>
            </fieldset>
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      試試一些反應式 (reactive) 範例: <Link href="/thermostat">溫控器</Link>,{' '}
      <Link href="/form">表單範例</Link>
    </p>
    <SourceCode page="home.tsx" />
  </div>
)

// And it can be pre-rendered into html as well
content_en = prerender(
  <>
    {style}
    {content_en}
  </>,
)

content_zh = prerender(
  <>
    {style}
    {content_zh}
  </>,
)

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
