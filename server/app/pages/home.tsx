import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { Routes } from '../routes.js'
import { title } from '../../config.js'
import { Locale } from '../components/locale.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let content = (
  <div id="home">
    <h1>
      <Locale en="Home Page" zh="首頁" />
    </h1>
    <p>
      <Locale
        en="You can get started by replacing the contents in this page"
        zh="你可以開始替換此頁面的內容"
      />
    </p>
    <SourceCode page="home.tsx" />
  </div>
)

// And it can be pre-rendered into html as well
let content_en = prerender(content, { language: 'en' })
let content_zh = prerender(content, { language: 'zh' })

let Home = <Locale en={content_en} zh={content_zh} />

let routes = {
  '/': {
    title: title('Home'),
    description: 'Home page',
    menuText: <Locale en="Home" zh="首頁" />,
    node: Home,
  },
} satisfies Routes

export default { routes }
