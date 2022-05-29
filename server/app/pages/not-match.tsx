import JSX from '../jsx/jsx.js'
import { getContextUrl } from '../context.js'
import { attrs } from '../jsx/types.js'

function Url(attrs: attrs) {
  let url = getContextUrl(attrs)
  return url
}

let NotMatch = (
  <div id="not-match">
    <h2>404 Page Not Found</h2>
    <p>
      url:{' '}
      <code>
        <Url />
      </code>
    </p>
  </div>
)

export default NotMatch
