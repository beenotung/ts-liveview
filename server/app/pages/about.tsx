import { o } from '../jsx/jsx.js'
import { existsSync, readFileSync } from 'fs'
import { Switch } from '../components/router.js'
import { Raw } from '../components/raw.js'
import { prerender } from '../jsx/html.js'
import { Menu } from '../components/menu.js'
import SourceCode from '../components/source-code.js'
import { markdownToHtml } from '../format/markdown.js'
import hljs from 'highlight.js/lib/core'
import hljs_markdown from 'highlight.js/lib/languages/markdown'
import { CodeBlock } from '../components/code-block.js'

hljs.registerLanguage('markdown', hljs_markdown)

let text = readFileSync('README.md').toString()

let html = Raw(await markdownToHtml(text))
let markdown = (
  <pre style="white-space: break-spaces; color: white">
    <code class="code-block">{text}</code>
  </pre>
)
markdown = (
  <pre>
    <link
      rel="stylesheet"
      href="/libs/highlight.js/styles/atom-one-dark-reasonable.css"
    />
    <code class="code-block hljs" style="color: white1">
      {Raw(hljs.highlight(text, { language: 'markdown' }).value)}
    </code>
  </pre>
)
markdown = (
  <pre>
    <CodeBlock code={text} language="markdown" />
  </pre>
)

// The JSX expression don't need to be re-built on every render
export let About = (
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

export const License = prerender(
  <p style="white-space:pre-wrap">
    {existsSync('LICENSE')
      ? readFileSync('LICENSE').toString()
      : 'LICENSE file is missing. You can put it in the project root directory, alone-side with the package.json'}
  </p>,
)

export default About
