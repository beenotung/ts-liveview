import JSX from '../jsx/jsx.js'
import type { attrs } from '../jsx/types.js'
import { getContext } from '../context.js'
import { debugLog } from '../../debug.js'
import { Style } from '../components/style.js'
import { getContextCookie } from '../cookie.js'
import { getOrSetTokenSync } from '../auth/token.js'
import { EarlyTerminate } from '../helpers.js'

const log = debugLog('demo-cookie-session.ts')
log.enabled = true

/** @description cannot call this when streaming html
 *  because it need to set cookie in response header
 * */
export function Token(attrs: attrs) {
  const context = getContext(attrs)
  if (context.type !== 'express') {
    return <p>This route is only supported as ajax</p>
  }
  const { req, res } = context
  switch (req.method) {
    case 'GET':
      getOrSetTokenSync(req, res)
      break
    case 'DELETE':
      res.clearCookie('token')
      break
    default:
      log(req.method, req.url)
      res.status(405).end('method not allowed')
      throw EarlyTerminate
  }
  return 'done'
}

export function DemoCookieSession(attrs: attrs) {
  const context = getContext(attrs)
  const cookies = getContextCookie(context)
  if (!cookies) {
    return (
      <div id="demo-cookie-session">
        <p>Cookies is required but not supported</p>
      </div>
    )
  }
  const { token, ...restCookies } = cookies
  // TODO send ajax from client to let server set HTTP-Only cookies
  return (
    <div id="demo-cookie-session">
      {Style(/* css */ `
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
      `)}
      <h2>Demo Cookie-based Session</h2>
      <div class="buttons">
        <button onclick="get('/cookie-session/token').then(()=>location.reload())">
          Refresh Token
        </button>
        <button onclick="del('/cookie-session/token').then(()=>location.reload())">
          Clear Token
        </button>
      </div>
      <fieldset>
        <legend>Cookies</legend>
        <pre>
          <code>
            {JSON.stringify(
              {
                ...restCookies,
                token: token ? '<hidden>' : '<none>',
              },
              null,
              2,
            )}
          </code>
        </pre>
      </fieldset>
    </div>
  )
}

export default {
  index: DemoCookieSession,
  Token,
}
