import JSX from '../jsx/jsx.js'
import { getContextUrl } from '../context.js'
import { attrs } from '../jsx/types.js'

function Url(attrs: attrs) {
  let url = getContextUrl(attrs)
  return url
}

let NotImplemented = (
  <div class="not-implemented">
    <h2>501 Not Implemented</h2>
    <p>
      url:{' '}
      <code>
        <Url />
      </code>
    </p>
  </div>
)

export default NotImplemented
