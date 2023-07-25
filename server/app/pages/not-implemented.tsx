import { o } from '../jsx/jsx.js'
import { Context, getContextUrl } from '../context.js'
import type { attrs, Node } from '../jsx/types'

function Url(_attrs: attrs, context: Context) {
  let url = getContextUrl(context)
  return url
}

let NotImplemented: Node = (
  <div class="not-implemented">
    <h1>501 Not Implemented</h1>
    <p>
      url:{' '}
      <code>
        <Url />
      </code>
    </p>
  </div>
)

export default NotImplemented
