import { Redirect, Link } from '../components/router.js'
import { Style } from '../components/style.js'
import { getContext } from '../context.js'
import JSX from '../jsx/jsx.js'
import { attrs } from '../jsx/types.js'

let count = 0

export function Thermostat(attrs: attrs) {
  let context = getContext(attrs)
  let cmd = context.routerMatch?.params.cmd
  let unknownCmd = false
  switch (cmd) {
    case 'inc':
      count++
      break
    case 'dec':
      count--
      break
    default:
      unknownCmd = true
      break
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
      <span id="count">{count}</span>
      <Link href="/thermostat/dec" no-history>
        <button>-</button>
      </Link>
    </div>
  )
}
