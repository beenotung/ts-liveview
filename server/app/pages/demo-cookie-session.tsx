import JSX from '../jsx/jsx.js'
import type { attrs } from '../jsx/types.js'
import { getContext } from '../context.js'
import { debugLog } from '../../debug.js'
import { getContextCookie, getCookieTokenSync } from '../auth/guard.js'
import { Style } from '../components/style.js'

const log = debugLog('demo-cookie-session.ts')
log.enabled = true

export function DemoCookieSession(attrs: attrs) {
  const context = getContext(attrs)
  const token = getCookieTokenSync(context)
  const cookies = getContextCookie(context)
  if (!cookies) {
    return (
      <div id="demo-cookie-session">
        <p>Cookie is required but not supported</p>
      </div>
    )
  }
  // TODO send ajax from client to let server set HTTP-Only cookies
  return (
    <div id="demo-cookie-session">
      {Style(/* css */ `
      #demo-cookie-session code {
        word-break: break-all;
        white-space: pre-wrap;
      }
      `)}
      <h2>Demo Cookie-based Session</h2>
      <p>token: {token?.slice(0, 3) + '...' + token?.slice(-3)}</p>
      <fieldset>
        <legend>Cookies</legend>
        <pre>
          <code>{JSON.stringify(cookies, null, 2)}</code>
        </pre>
      </fieldset>
    </div>
  )
}

export default DemoCookieSession
