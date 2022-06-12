import { format_relative_time } from '@beenotung/tslib/format.js'
import { Context, getContext, WsContext } from '../context.js'
import { debugLog } from '../../debug.js'
import { TimezoneDate } from 'timezone-date.ts'
import { Session, sessionToContext } from '../session.js'
import {
  DAY,
  HOUR,
  MINUTE,
  MONTH,
  SECOND,
  WEEK,
  YEAR,
} from '@beenotung/tslib/time.js'
import { ServerMessage } from '../../../client/index.js'
const { abs, floor } = Math

let log = debugLog('datetime.ts')
log.enabled = true

export function DateTimeText(attrs: {
  time: number
  relativeTimeThreshold?: number
}) {
  let context = getContext(attrs)
  return formatDateTimeText(attrs, context)
}

export function formatDateTimeText(
  attrs: {
    time: number
    relativeTimeThreshold?: number
  },
  context: Context,
): string {
  if (attrs.relativeTimeThreshold !== undefined) {
    let diff = attrs.time - Date.now()
    if (Math.abs(diff) < attrs.relativeTimeThreshold) {
      return format_relative_time(diff, 0)
    }
  }
  return toLocaleDateTimeString(attrs.time, context)
}

export function toLocaleDateTimeString(time: number, context: Context): string {
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

export type RelativeTimeOptions = {
  time: number
  selector: string
}

export type CreateRelativeTimerOptions = {
  sessionFilter: (session: Session) => boolean
  multiple?: boolean // instruct to use querySelector or querySelectorAll
  relativeTimeThreshold?: number // default is YEAR
}
export function createRelativeTimer(options: CreateRelativeTimerOptions) {
  const { sessionFilter } = options
  const relativeTimeThreshold = options.relativeTimeThreshold || YEAR
  const msgType = options.multiple
    ? ('update-all-text' as const)
    : ('update-text' as const)
  const timerSelectors = new Set<string>()
  const timerSessions = new Set<Session>()
  function startRelativeTimer(options: RelativeTimeOptions, context: Context) {
    if (context.type === 'ws') {
      timerSessions.add(context.session)
    }
    let diff = abs(options.time - Date.now())
    if (diff >= relativeTimeThreshold || timerSelectors.has(options.selector)) {
      return
    }
    timerSelectors.add(options.selector)
    let pair = formatRelativeTime(diff)
    let interval = pair ? pair[1] : undefined
    setTimeout(tickTimer, interval, options)
  }
  function tickTimer(options: RelativeTimeOptions) {
    let delta = options.time - Date.now()
    let diff = abs(delta)
    let pair = formatRelativeTime(diff)
    if (!pair) {
      timerSelectors.delete(options.selector)
      timerSessions.forEach(session => {
        if (!sessionFilter(session)) {
          timerSessions.delete(session)
          return
        }
        let context = sessionToContext(session, session.url!)
        let text = toLocaleDateTimeString(options.time, context)
        let message: ServerMessage = [msgType, options.selector, text]
        session.ws.send(message)
      })
      return
    }
    let [text, interval] = pair
    if (diff >= SECOND) {
      text += delta < 0 ? ' ago' : ' hence'
    }
    let message: ServerMessage = [msgType, options.selector, text]
    timerSessions.forEach(session => {
      if (!sessionFilter(session)) {
        timerSessions.delete(session)
        return
      }
      session.ws.send(message)
    })
    setTimeout(tickTimer, interval, options)
  }
  return { startRelativeTimer }
}

const formatRelativeTimePairs: Array<[interval: number, unit: string]> = [
  [SECOND, 'second'],
  [MINUTE, 'minute'],
  [HOUR, 'hour'],
  [DAY, 'day'],
  [WEEK, 'week'],
  [MONTH, 'month'],
  [YEAR, 'year'],
]
function formatRelativeTime(
  diff: number,
): [text: string, next_interval: number] | null {
  if (diff < SECOND) {
    return ['just now', SECOND - (diff % SECOND)]
  }
  let lastInterval = SECOND
  let lastUnit = ''
  for (let [interval, unit] of formatRelativeTimePairs) {
    if (diff < interval) {
      return [
        floor(diff / lastInterval) + ' ' + lastUnit + 's',
        lastInterval - (diff % lastInterval),
      ]
    }
    if (diff === interval) {
      return ['1 ' + unit, interval - (diff % interval)]
    }
    lastInterval = interval
    lastUnit = unit
  }
  return null
}

export default DateTimeText
