import { readFileSync } from 'fs'
import { join } from 'path'
import JSX from '../jsx/jsx.js'

function SourceCode(attrs: { page: string }) {
  let file = join('server', 'app', 'pages', attrs.page)
  let source = readFileSync(file).toString()
  return (
    <details class="source-code">
      <summary>
        <b>
          Source Code of <code>{attrs.page}</code>
        </b>
      </summary>
      <link rel="stylesheet" href="/prism/prism.css" />
      <script src="/prism/prism.js"></script>
      <pre>
        <code class="language-tsx">{source}</code>
      </pre>
    </details>
  )
}

export default SourceCode
