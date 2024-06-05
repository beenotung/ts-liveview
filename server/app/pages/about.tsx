import { o } from '../jsx/jsx.js'
import { existsSync, readFileSync } from 'fs'
import { Switch } from '../components/router.js'
import { Raw } from '../components/raw.js'
import { prerender } from '../jsx/html.js'
import { Menu } from '../components/menu.js'
import SourceCode from '../components/source-code.js'
import { markdownToHtml } from '../format/markdown.js'
import { Routes } from '../routes.js'
import { title } from '../../config.js'
import { StaticFile } from '../components/static-file.js'

let text = readFileSync('README.md').toString()

let html = Raw(await markdownToHtml(text))
let markdown = <pre style="white-space: break-spaces">{text}</pre>
markdown = (
  <pre>
    <code class="language-markdown">{text}</code>
  </pre>
)

// The JSX expression don't need to be re-built on every render
let About = (
  <div id="about">
    <h1>About Page</h1>
    <p>
      This page is generated from README.md in the <code>markdown</code> format.
    </p>
    <p>
      The conversion is done on the server powered by{' '}
      <a href="https://www.npmjs.com/package/marked">marked</a>, a node.js
      library, No need to ship javascript library to the client ;)
    </p>
    <p>
      Also, the html is generated only once and cached in memory. This technique
      is known as <abbr title="Static Site Generation">SSG</abbr>, which is more
      efficient than <abbr title="Server-Side Rendering">SSR</abbr> for static
      content (that doesn't change regarding on the request session).
    </p>
    <SourceCode page="about.tsx" />
    <p>This page also demonstrate nested routes.</p>
    <fieldset>
      <legend>
        <Menu
          routes={[
            { url: '/about', menuText: 'Rendered HTML' },
            { url: '/about/markdown', menuText: 'Source Markdown' },
          ]}
          separator=" / "
        />
      </legend>
      {Switch({
        '/about': html,
        '/about/markdown': markdown,
      })}
    </fieldset>
  </div>
)

const License = prerender(
  <p style="white-space:pre-wrap">
    {existsSync('LICENSE')
      ? readFileSync('LICENSE').toString()
      : 'LICENSE file is missing. You can put it in the project root directory, alone-side with the package.json'}
  </p>,
)

// StaticFile is a helper function, it is functionally identical to above code for the license file
const Help = StaticFile('help.txt')

let routes = {
  '/about/:mode?': {
    title: title('About'),
    description:
      'About ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
    menuText: 'About',
    menuUrl: '/about',
    menuMatchPrefix: true,
    node: About,
    streaming: true,
  },
  '/LICENSE': {
    title: 'BSD 2-Clause License of ts-liveview',
    description:
      'ts-liveview is a free open source project licensed under the BSD 2-Clause License',
    node: License,
  },
  '/help.txt': {
    title: 'Getting started on ts-liveview',
    description:
      'Getting started guide of ts-liveview with bash scripts and npm scripts',
    node: Help,
  },
} satisfies Routes

export default { routes }
