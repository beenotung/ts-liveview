import { readFileSync } from 'fs'
import { join } from 'path'
import { o } from '../jsx/jsx.js'

export let SourceCodeStyle = /* css */ `
pre[class*="language-"],
code[class*="language-"] {
  white-space: pre-wrap !important;
  display: inline-block !important;
  max-width: 90vw;
}
details.source-code details summary {
  margin-top: 0.5rem;
  margin-inline-start: 1rem;
}
.source-code summary {
  cursor: pointer;
}
`

function SourceCode(attrs: { page: string }) {
  let file = join('server', 'app', 'pages', attrs.page)
  let source = readFileSync(file).toString()
  let parts = source.split('\n\n')
  let importPart: string | undefined
  if (parts.length > 1 && parts[0].startsWith('import')) {
    importPart = parts.shift()
    source = parts.join('\n\n')
  }
  return (
    <details class="source-code">
      <summary>
        <b>
          Source Code of <code>{attrs.page}</code>
        </b>
      </summary>
      <link rel="stylesheet" href="/lib/prism/prism.css" />
      <script src="/lib/prism/prism.js"></script>
      {importPart ? (
        <>
          <details>
            <summary>
              (import statements omitted for simplicity, click to expand)
            </summary>
            <pre>
              <code class="language-tsx">{importPart}</code>
            </pre>
          </details>
        </>
      ) : null}
      <pre>
        <code class="language-tsx">{source}</code>
      </pre>
    </details>
  )
}

export default SourceCode
