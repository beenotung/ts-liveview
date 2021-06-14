import { Redirect, Link } from '../components/router.js'
import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'
import type { ComponentFn } from '../jsx/types'

let current = 0

export function inc() {
  current++
  return redirect()
}

export function dec() {
  current--
  return redirect()
}

function redirect() {
  return (
    <>
      <Redirect href="/thermostat" />
      <Thermostat />
    </>
  )
}

export function Thermostat() {
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

export default {
  inc,
  dec,
  index: Thermostat as ComponentFn,
}
