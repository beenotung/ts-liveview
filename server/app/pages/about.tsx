import JSX from '../jsx/jsx.js'
import { readFileSync } from 'fs'
import { Link, Switch } from '../components/router.js'
import marked from 'marked'
import { Raw } from '../components/raw.js'
import { attrs } from '../jsx/types'
import { getContextUrl } from '../context.js'
import { flagsToClassName } from '../jsx/html.js'

let text = readFileSync('README.md').toString()

let html = Raw(marked(text))
let markdown = <pre style="white-space: break-spaces">{text}</pre>

function Menu(attrs: attrs) {
  let url = getContextUrl(attrs)
  return (
    <div id="menu">
      <Link
        href="/about/html"
        class={flagsToClassName({
          selected: url === '/about/html' || url === '/about',
        })}
      >
        Rendered HTML
      </Link>
      {' / '}
      <Link
        href="/about/markdown"
        class={flagsToClassName({ selected: url === '/about/markdown' })}
      >
        Source Markdown
      </Link>
    </div>
  )
}

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
      library. No need to ship javascript library to the client ;)
    </p>
    <p>This page also demonstrate nested routes.</p>
    <fieldset>
      <legend>
        <Menu />
      </legend>
      {Switch({
        '/about': html,
        '/about/html': html,
        '/about/markdown': markdown,
      })}
    </fieldset>
  </div>
)
