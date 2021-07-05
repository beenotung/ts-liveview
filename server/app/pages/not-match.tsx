import JSX from '../jsx/jsx.js'
import { getContextUrl } from '../context.js'
import { attrs } from '../jsx/types.js'

export function NotMatch(attrs: attrs) {
  let url = getContextUrl(attrs)
  return (
    <div id="not-match">
      <h2>404 Page Not Found</h2>
      <p>
        url: <code>{url}</code>
      </p>
    </div>
  )
}

export default NotMatch
