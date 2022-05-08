import {
  format_relative_time,
  round_time_diff,
} from '@beenotung/tslib/format.js'
import { Context, getContext } from '../context.js'
import { debugLog } from '../../debug.js'
import { TimezoneDate } from 'timezone-date.ts'

let log = debugLog('datetime.ts')
log.enabled = true

export function DateTimeText(attrs: {
  time: number
  relativeTimeThreshold?: number
}) {
  if (attrs.relativeTimeThreshold !== undefined) {
    let diff = attrs.time - Date.now()
    if (Math.abs(diff) < attrs.relativeTimeThreshold) {
      return format_relative_time(round_time_diff(diff))
    }
  }

  let context = getContext(attrs)
  return toLocaleDateTimeString(attrs.time, context)
}

export function toLocaleDateTimeString(time: number, context: Context) {
  let locales: string | undefined
  let timeZone: string | undefined
  let timezoneOffset: number | undefined
  if (context.type === 'express') {
    locales = context.req.headers['accept-language']
      ?.split(',')[0]
      .replace('_', '-')
  } else if (context.type === 'ws') {
    let session = context.session
    locales = session.locales
    timeZone = session.timeZone
    timezoneOffset = session.timezoneOffset
  }
  for (;;) {
    try {
      let date = new TimezoneDate(time)
      if (timezoneOffset !== undefined) {
        date.setTimezoneOffset(timezoneOffset)
      }
      return date.toLocaleString(locales, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        hour12: true,
        minute: '2-digit',
        timeZone,
      })
    } catch (error) {
      let errorMessage = (error as any).toString()
      if (errorMessage.includes('time zone')) {
        log('invalid timezone:', timeZone)
        timeZone = undefined
        continue
      }
      if (errorMessage.includes('locale')) {
        log('invalid locale', locales)
        locales = undefined
        continue
      }
      log('failed to format date', {
        locales,
        timeZone,
        error,
      })
      timeZone = undefined
      locales = undefined
    }
  }
}

export default DateTimeText
