import JSX from '../jsx/jsx.js'
import type { attrs } from '../jsx/types.js'
import { getContext } from '../context.js'
import { debugLog } from '../../debug.js'
import { getCookieTokenSync } from '../auth/guard.js'

const log = debugLog('demo-cookie-session.ts')
log.enabled = true

export function DemoCookieSession(attrs: attrs) {
  const context = getContext(attrs)
  let token = getCookieTokenSync(context)
  log('token:', token)
  return (
    <div id="demo-cookie-session">
      <h2>Demo Cookie-based Session</h2>
      <p>token: {token}</p>
    </div>
  )
}

export default DemoCookieSession
