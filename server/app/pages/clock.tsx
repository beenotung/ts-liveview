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
import { Locale, Title } from '../components/locale.js'
import { Routes } from '../routes.js'

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
    <p id="scrClock">
      <ClockText />
    </p>
    {iife(
      function (options: Intl.DateTimeFormatOptions) {
        let date = new Date()
        let lang = navigator.language
        function tickClock() {
          if (typeof scrClock === 'undefined') {
            // stop the loop when this component is out of sight
            return
          }
          let time = Date.now()
          date.setTime(time)
          scrClock.textContent = date.toLocaleString(lang, options)
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
declare let scrClock: HTMLDivElement | undefined

let t = <Locale en="Clock" zh_hk="時鐘" zh_cn="时钟" />

let routes = {
  '/clock': {
    menuText: t,
    title: <Title t={t} />,
    description: (
      <Locale
        en="Realtime clock using system time localized with client language and timezone"
        zh_hk="使用系統時間的即時時鐘，根據客戶端的語言和時區本地化"
        zh_cn="使用系统时间的即时时钟，根据客户端的语言和时区本地化"
      />
    ),
    node: Clock,
  },
} satisfies Routes

export default { routes }
