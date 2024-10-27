import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import { Locale } from '../components/locale.js'
import { sessions } from '../session.js'
import { ServerMessage } from '../../../client/types.js'
import { format_time_duration } from '@beenotung/tslib/format.js'
import { Context } from '../context.js'
import { EarlyTerminate } from '../../exception.js'
import { Redirect } from '../components/router.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let introduction = (
  <>
    <h1>
      <Locale en="Home Page" zh="首頁" />
    </h1>
    <p>
      <Locale
        en="You can get started by replacing the contents in this page"
        zh="你可以開始替換此頁面的內容"
      />
    </p>
  </>
)

// And it can be pre-rendered into html as well
let introduction_en = prerender(introduction, { language: 'en' })
let introduction_zh = prerender(introduction, { language: 'zh' })

let count = 0

let home = (
  <div id="home">
    <Locale en={introduction_en} zh={introduction_zh} />
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
)

// demo updates from server-side
function tick() {
  let uptime = format_time_duration(process.uptime() * 1000)
  broadcast(['update-text', '#uptime', uptime])
}
setInterval(tick, 1000)

function Inc(attrs: {}, context: Context) {
  count++
  if (context.type == 'ws') {
    broadcast(['update-text', '#count', count])
    if (context.type == 'ws') {
      context.ws.send([
        'update-attrs',
        '#home button',
        { style: 'color:green' },
      ])
      throw EarlyTerminate
    }
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
    title: title('Home'),
    description: 'Home page',
    menuText: <Locale en="Home" zh="首頁" />,
    node: home,
  },
  '/inc': {
    title: apiEndpointTitle,
    description: 'Increment counter on server',
    node: <Inc />,
  },
} satisfies Routes

export default { routes }
