import { o } from '../jsx/jsx.js'
import type { attrs } from '../jsx/types'
import { debugLog } from '../../debug.js'
import { Style } from '../components/style.js'
import { getContextCookies, mustCookieSecure } from '../cookie.js'
import type { Request, Response, Router } from 'express'
import SourceCode from '../components/source-code.js'
import type { Context } from '../context'
import { Routes } from '../routes.js'
import { title } from '../../config.js'
import { renderError } from '../components/error.js'

const log = debugLog('demo-cookie-session.ts')
log.enabled = true

let style = Style(/* css */ `
#demo-cookie-session code {
  word-break: break-all;
  white-space: pre-wrap;
}
#demo-cookie-session .buttons {
  margin: 1em 0;
}
#demo-cookie-session button {
  margin: 0 0.5em;
}
#demo-cookie-session fieldset {
  display: inline-block
}
`)

function DemoCookieSession(_attrs: attrs, context: Context) {
  const cookies = getContextCookies(context)
  log('cookies:', cookies)
  log('signed cookie:')
  if (!cookies) {
    return (
      <div id="demo-cookie-session">
        {renderError('Cookies is required but not supported', context)}
      </div>
    )
  }
  let { token, ...restCookies } = cookies.signedCookies
  return (
    <div id="demo-cookie-session">
      {style}
      <h1>Demo Cookie-based Session</h1>
      <p>For demo purpose, the token cookie will expire in 30 seconds</p>
      <div class="buttons">
        <button onclick="get('/cookie-session/token').then(()=>location.reload())">
          Refresh Token
        </button>
        <button onclick="del('/cookie-session/token').then(()=>location.reload())">
          Clear Token
        </button>
      </div>
      <fieldset>
        <legend>Unsigned Cookies</legend>
        <pre>
          <code>{JSON.stringify(cookies.unsignedCookies, null, 2)}</code>
        </pre>
      </fieldset>
      <fieldset>
        <legend>Signed Cookies</legend>
        <pre>
          <code>
            {JSON.stringify(
              { ...restCookies, token: token ? '<hidden>' : '<none>' },
              null,
              2,
            )}
          </code>
        </pre>
      </fieldset>
      <SourceCode page="demo-cookie-session.tsx" />
    </div>
  )
}

/** @description cannot call this when streaming html
 *  because it need to set cookie in response header
 * */
function deleteToken(req: Request, res: Response) {
  res.clearCookie('token')
  res.end('ok')
}

/** @description cannot call this when streaming html
 *  because it need to set cookie in response header
 * */
function refreshToken(req: Request, res: Response) {
  let token = randomToken()
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    signed: true,
    secure: mustCookieSecure,
    maxAge: 30 * 1000, // 30 seconds
  })
  res.end('ok')
}

function randomToken(): string {
  let token = Math.random().toString(36).slice(2)
  return token
}

// liveview-routes
let routes = {
  '/cookie-session': {
    title: title('Cookie-based Session'),
    description: 'Demonstrate accessing cookie with ts-liveview',
    menuText: 'Cookie Session',
    node: <DemoCookieSession />,
  },
} satisfies Routes

// ajax-routes
function attachRoutes(app: Router) {
  app.delete('/cookie-session/token', deleteToken)
  app.get('/cookie-session/token', refreshToken)
}

export default {
  routes,
  attachRoutes,
}
