import { o } from '../jsx/jsx.js'
import { TimezoneDate } from 'timezone-date.ts'
import {
  DefaultLocaleDateTimeFormatOptions,
  LocaleDateTimeFormatOptions,
} from '../components/datetime.js'
import { SECOND } from '@beenotung/tslib/time.js'
import { toLocaleDateTimeString } from '../components/datetime.js'
import { sessions } from '../session.js'
import { Context } from '../context.js'
import { Script } from '../components/script.js'

let options: LocaleDateTimeFormatOptions = {
  ...DefaultLocaleDateTimeFormatOptions,
  second: '2-digit',
}

function startClock() {
  let date = new TimezoneDate()
  function loopClock() {
    let time = Date.now()
    date.setTime(time)
    sessions.forEach(session => {
      if (session.timezoneOffset !== undefined) {
        date.setTimezoneOffset(session.timezoneOffset)
      }
      let text = date.toLocaleString(session.locales, {
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

const Clock = (_attrs: {}, context: Context) => (
  <>
    <h2>Clock Demo</h2>
    <p>
      This page demonstrates how to show content with respect to the client's
      language and timezone.
    </p>
    <h3>Server-side Rendered Clock</h3>
    <p>This is showing system time from the server, updated over websocket.</p>
    <div id="ssrClock">
      {toLocaleDateTimeString(Date.now(), context, options)}
    </div>
    <h3>Client-side Rendered Clock</h3>
    <p>This is showing system time from the browser, updated locally.</p>
    <div id="spaClock"></div>
    {Script(`
function tickClock(){
  let date = new Date()
  let lang = navigator.language
  let options = ${JSON.stringify(options)}
  spaClock.textContent = date.toLocaleString(lang, options)
  let time = date.getTime()
  date.setMilliseconds(0)
  let diff = time - date.getTime()
  let interval = 1000 - diff
  setTimeout(tickClock, interval)
}
setTimeout(tickClock)
    `)}
  </>
)

export default Clock
