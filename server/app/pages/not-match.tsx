import { o } from '../jsx/jsx.js'
import { getContextUrl } from '../context.js'
import type { ComponentFn, Node } from '../jsx/types'
import SourceCode from '../components/source-code.js'

let Url: ComponentFn = (_attrs: {}, context) => {
  let url = getContextUrl(context)
  return url
}

let NotMatch: Node = (
  <div id="not-match">
    <h2>404 Page Not Found</h2>
    <p>
      url:{' '}
      <code>
        <Url />
      </code>
    </p>
    <SourceCode page="not-match.tsx" />
  </div>
)

export default NotMatch
