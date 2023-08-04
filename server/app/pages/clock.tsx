import { o } from '../jsx/jsx.js'
import {
  DefaultLocaleDateTimeFormatOptions,
  LocaleDateTimeFormatOptions,
} from '../components/datetime.js'
import { SECOND } from '@beenotung/tslib/time.js'
import { toLocaleDateTimeString } from '../components/datetime.js'
import { sessions } from '../session.js'
import { Context } from '../context.js'
import { iife } from '../components/script.js'
import SourceCode from '../components/source-code.js'

let options: LocaleDateTimeFormatOptions = {
  ...DefaultLocaleDateTimeFormatOptions,
  second: '2-digit',
}

function startClock() {
  let date = new Date()
  function loopClock() {
    let time = Date.now()
    date.setTime(time)
    sessions.forEach(session => {
      if (session.url !== '/clock') {
        return
      }
      let text = date.toLocaleString(session.language, {
        ...options,
        timeZone: session.timeZone,
      })
      session.ws.send(['update-text', '#ssrClock', text])
    })
    date.setMilliseconds(0)
    let diff = time - date.getTime()
    let interval = SECOND - diff
    setTimeout(loopClock, interval)
  }
  setTimeout(loopClock)
}
startClock()

function ClockText(_attrs: {}, context: Context) {
  return toLocaleDateTimeString(Date.now(), context, options)
}

const Clock = (
  <div id="clock">
    <h1>Clock Demo</h1>
    <p>
      This page demonstrates how to show content with respect to the client's
      language and timezone.
    </p>
    <h2>Server-side Rendered Clock</h2>
    <p>This is showing system time from the server, updated over websocket.</p>
    <p id="ssrClock">
      <ClockText />
    </p>
    <h2>Client-side Rendered Clock</h2>
    <p>This is showing system time from the browser, updated locally.</p>
    <p>
      The initial value is rendered on the server, then "re-hydrated" on the
      client.
    </p>
    <p id="spaClock">
      <ClockText />
    </p>
    {iife(
      function (options: Intl.DateTimeFormatOptions) {
        let date = new Date()
        let lang = navigator.language
        function tickClock() {
          if (typeof spaClock === 'undefined') {
            // stop the loop when this component is out of sight
            return
          }
          let time = Date.now()
          date.setTime(time)
          spaClock.textContent = date.toLocaleString(lang, options)
          date.setMilliseconds(0)
          let diff = time - date.getTime()
          let interval = 1000 - diff
          setTimeout(tickClock, interval)
        }
        tickClock()
      },
      [
        {
          ...DefaultLocaleDateTimeFormatOptions,
          second: '2-digit',
        },
      ],
    )}
    <SourceCode page="clock.tsx" />
  </div>
)
declare let spaClock: HTMLDivElement | undefined

export default Clock
