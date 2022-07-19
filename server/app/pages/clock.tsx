import { o } from '../jsx/jsx.js'
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
  let date = new Date()
  function loopClock() {
    let time = Date.now()
    date.setTime(time)
    sessions.forEach(session => {
      if (session.url !== '/clock') {
        return
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

function ClockText(_attrs: {}, context: Context) {
  return toLocaleDateTimeString(Date.now(), context, options)
}

const Clock = (
  <div id="clock">
    <h2>Clock Demo</h2>
    <p>
      This page demonstrates how to show content with respect to the client's
      language and timezone.
    </p>
    <h3>Server-side Rendered Clock</h3>
    <p>This is showing system time from the server, updated over websocket.</p>
    <div id="ssrClock">
      <ClockText />
    </div>
    <h3>Client-side Rendered Clock</h3>
    <p>This is showing system time from the browser, updated locally.</p>
    <p>The initial value is rendered on the server, then "re-hydrated" on the client.</p>
    <div id="spaClock">
      <ClockText />
    </div>
    {Script(`
/* use iife (Immediately Invoked Function Expression) to avoid name clash with other parts of the page. */
;(function(){
  let date = new Date();
  let lang = navigator.language;
  let options = ${JSON.stringify(options)};
  function tickClock() {
    if (typeof spaClock === "undefined") {
      return; /* stop the loop when this component is out of sight */
    }
    let time = Date.now();
    date.setTime(time);
    spaClock.textContent = date.toLocaleString(lang, options);
    date.setMilliseconds(0);
		let diff = time - date.getTime();
    let interval = 1000 - diff;
    setTimeout(tickClock, interval);
  }
  tickClock();
})();
`)}
  </div>
)

export default Clock
