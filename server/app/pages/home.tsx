import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { Routes } from '../routes.js'
import Style from '../components/style.js'
import { Locale } from '../components/locale.js'
import { apiEndpointTitle, title } from '../../config.js'
import { sessions } from '../session.js'
import { ServerMessage } from '../../../client/types.js'
import { format_time_duration } from '@beenotung/tslib/format.js'
import { Context } from '../context.js'
import { EarlyTerminate } from '../../exception.js'
import { Link, Redirect } from '../components/router.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let style = Style(/* css */ `
`)

let introduction = (
  <>
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
  </>
)

// And it can be pre-rendered into html as well
//
// This example is optimized for static content,
// you can reference other pages for routes with dynamic content
// using <Title> and <Locale> in route title and description

let introduction_en = prerender(introduction, { language: 'en' })
let introduction_zh_hk = prerender(introduction, { language: 'zh_hk' })
let introduction_zh_cn = prerender(introduction, { language: 'zh_cn' })

let count = 0

let home = (
  <>
    {style}
    <div id="home">
      <Locale
        en={introduction_en}
        zh_hk={introduction_zh_hk}
        zh_cn={introduction_zh_cn}
      />
      {/* ------------------------------ */}
      <h2>
        <Locale en="Database Demo" zh_hk="數據庫示範" zh_cn="数据库示范" />
      </h2>
      <p>
        <Locale en="Try the " zh_hk="試試 " zh_cn="试试 " />
        <Link href="/task-demo">
          <Locale en="Task Demo" zh_hk="任務示範" zh_cn="任务示范" />
        </Link>
        <Locale
          en=" to see a simple CRUD example with database."
          zh_hk=" 來查看一個簡單的數據庫 CRUD 範例。"
          zh_cn=" 来查看一个简单的数据库 CRUD 示例。"
        />
      </p>
      {/* ------------------------------ */}
      <h2>Demo updates from server-side</h2>
      <p>The uptime is updated by server every second.</p>
      Up-time: <span id="uptime">This is updated by server.</span>
      {/* ------------------------------ */}
      <h2>Demo updates from client-side</h2>
      <p>Try to open this page in multiple tabs.</p>
      <button onclick="emit('/inc')">
        Click to update: <span id="count">{count}</span>
      </button>
      {/* ------------------------------ */}
      <SourceCode page="home.tsx" />
    </div>
  </>
)

// demo updates from server-side
function tick() {
  let uptime = format_time_duration(process.uptime() * 1000)
  broadcast(['update-text', '#uptime', uptime])
}
setInterval(tick, 1000)

// This function will be called on the server-side when the '/inc' endpoint is hit
function Inc(attrs: {}, context: Context) {
  count++
  broadcast(['update-text', '#count', count])
  if (context.type == 'ws') {
    context.ws.send(['update-attrs', '#home button', { style: 'color:green' }])
    throw EarlyTerminate
  }
  return <Redirect href="/" />
}

function broadcast(message: ServerMessage) {
  sessions.forEach(session => {
    session.ws.send(message)
  })
}

let routes = {
  '/': {
    title: (
      <Locale en={title('Home')} zh_hk={title('主頁')} zh_cn={title('主页')} />
    ),
    description: (
      <Locale
        en="Demo how to update from server-side and client-side"
        zh_hk="示範如何從伺服器和客戶端更新"
        zh_cn="演示如何从服务器和客户端更新"
      />
    ),
    menuText: <Locale en="Home" zh_hk="主頁" zh_cn="主页" />,
    node: home,
  },
  '/inc': {
    title: apiEndpointTitle,
    description: 'Increment counter on server',
    node: <Inc />,
  },
} satisfies Routes

export default { routes }
