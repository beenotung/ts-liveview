import { format_relative_time, setLang } from '@beenotung/tslib/format.js'
import { o } from '../jsx/jsx.js'
import { Context, WsContext } from '../context.js'
import { TimezoneDate } from 'timezone-date.ts'
import { d2 } from 'cast.ts'
import { isPreferZh } from './locale.js'
import { toLocaleDateTimeString } from './datetime.js'

/** output format: `2 minutes ago` or `12.5 分鐘後` */
export function relative_timestamp(time: number, context: Context) {
  if (isPreferZh(context)) {
    setLang('zh-HK')
  } else {
    setLang('en-US')
  }
  return (
    <time datetime={new Date(time).toISOString()}>
      {format_relative_time(time - Date.now(), 0)}
    </time>
  )
}

/** output format: `2025-09-08 18:07` */
export function absolute_timestamp(time: number, context: Context) {
  let date = new TimezoneDate(time)
  let timezoneOffset = (context as WsContext).session?.timezoneOffset
  if (timezoneOffset) {
    date.timezone = timezoneOffset
  }
  let y = date.getFullYear()
  let m = d2(date.getMonth() + 1)
  let d = d2(date.getDate())
  let H = d2(date.getHours())
  let M = d2(date.getMinutes())
  return (
    <time datetime={date.toISOString()}>
      {y}-{m}-{d} {H}:{M}
    </time>
  )
}

/** output format: `18:07:54` */
export function feedback_timestamp(context: Context, time = Date.now()) {
  return toLocaleDateTimeString(time, context, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
