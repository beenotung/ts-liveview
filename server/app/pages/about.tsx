import JSX from '../jsx/jsx.js'
import { readFileSync } from 'fs'
import { Switch } from '../components/router.js'
import { marked } from 'marked'
import { Raw } from '../components/raw.js'
import { prerender } from '../jsx/html.js'
import { Menu } from '../components/menu.js'

let text = readFileSync('README.md').toString()

let html = Raw(marked(text))
let markdown = <pre style="white-space: break-spaces">{text}</pre>

// The JSX expression don't need to be re-built on every render
export let About = (
  <div id="about">
    <h2>About Page</h2>
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
    <p>This page also demonstrate nested routes.</p>
    <fieldset>
      <legend>
        <Menu
          routes={[
            ['/about', 'Rendered HTML'],
            ['/about/markdown', 'Source Markdown'],
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
  <p style="white-space:pre-wrap">{readFileSync('LICENSE').toString()}</p>,
)

export default About
