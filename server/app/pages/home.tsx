import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import SourceCode from '../components/source-code.js'
import { Routes } from '../routes.js'
import { title } from '../../config.js'
import Style from '../components/style.js'

// Calling <Component/> will transform the JSX into AST for each rendering.
// You can reuse a pre-compute AST like `let component = <Component/>`.

// If the expression is static (not depending on the render Context),
// you don't have to wrap it by a function at all.

let style = Style(/* css */ `
`)

let content = (
  <div id="home">
    <h1>Home Page</h1>
    <p>You can get started by replacing the contents in this page</p>
    <p>
      When the browser load this url, the server responses complete html content
      to the GET request. This allows the browser to perform meaningful paint as
      soon as possible. And it's ideal for SEO.
    </p>
    <p>
      Try some reactive demo:{' '}
      <a href="https://liveviews.cc/thermostat" target="_blank">
        Thermostat
      </a>
      ,{' '}
      <a href="https://liveviews.cc/form" target="_blank">
        Form Demo
      </a>
    </p>
    <SourceCode page="home.tsx" />
  </div>
)

// And it can be pre-rendered into html as well
let Home = prerender(
  <>
    {style}
    {content}
  </>,
)

let routes = {
  '/': {
    title: title('Home'),
    description:
      'Getting Started with ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    menuText: 'Home',
    node: Home,
  },
} satisfies Routes

export default { routes }
