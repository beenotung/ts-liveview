import { Redirect, Link } from '../components/router.js'
import { Style } from '../components/style.js'
import { getContext } from '../context.js'
import { Message } from '../helpers.js'
import JSX from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'

let current = 0

export function Thermostat(attrs: attrs) {
  let context = getContext(attrs)
  let cmd = context.routerMatch?.params.cmd
  let unknownCmd = false
  switch (cmd) {
    case 'inc':
      current++
      break
    case 'dec':
      current--
      break
    default:
      unknownCmd = true
      break
  }
  if (context.type === 'ws' && context.url.startsWith('/thermostat')) {
    // TODO detect if the client is already on this page before using this update-shortcut
    // throw new Message(['update-in', '#thermostat #count', count])
  }
  return (
    <div id="thermostat">
      {Style(`
        #thermostat button {
            margin: 0.25em;
            font-size: larger;
        }
        #thermostat [data-live=redirect] {
            display: block;
        }
        `)}
      {cmd ? (
        unknownCmd ? (
          <p>
            Unknown cmd: <code>{cmd}</code>
          </p>
        ) : (
          Redirect('/thermostat')
        )
      ) : null}
      <Link href="/thermostat/inc" no-history>
        <button>+</button>
      </Link>
      <span id="count">{current}</span>
      <Link href="/thermostat/dec" no-history>
        <button>-</button>
      </Link>
    </div>
  )
}
