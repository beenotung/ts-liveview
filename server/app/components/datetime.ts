import { format_relative_time } from '@beenotung/tslib/format.js'
import { getContextLanguage, Context, getContextTimezone } from '../context.js'
import { debugLog } from '../../debug.js'
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
import type { ServerMessage } from '../../../client/types'
import { db } from '../../../db/db.js'
import { config } from '../../config.js'
const { abs, floor } = Math

let log = debugLog('datetime.ts')
log.enabled = true

export function DateTimeText(
  attrs: {
    time: number | Date
    relativeTimeThreshold?: number
  },
  context: Context,
) {
  return formatDateTimeText(attrs, context)
}

export function formatDateTimeText(
  attrs: {
    time: number | Date
    relativeTimeThreshold?: number
    options?: LocaleDateTimeFormatOptions
  },
  context: Context,
): string {
  if (attrs.relativeTimeThreshold !== undefined) {
    let diff = toTime(attrs.time) - Date.now()
    if (Math.abs(diff) < attrs.relativeTimeThreshold) {
      return format_relative_time(diff, 0)
    }
  }
  return toLocaleDateTimeString(attrs.time, context, attrs.options)
}

export type LocaleDateTimeFormatOptions = Omit<
  Intl.DateTimeFormatOptions,
  'timeZone'
>
export const DefaultLocaleDateTimeFormatOptions: LocaleDateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  hour12: true,
  minute: '2-digit',
}

let select_most_popular_locale = db
  .prepare<void[], string>(
    /* sql */ `
select language
from request_session
where language is not null
group by language
order by count(*) desc
limit 1
`,
  )
  .pluck()

function getDefaultLocale(): string {
  return select_most_popular_locale.get() || config.default_locale
}

let select_most_popular_timezone = db
  .prepare<void[], string>(
    /* sql */ `
select timezone
from request_session
where timezone is not null
group by timezone
order by count(*) desc
limit 1
`,
  )
  .pluck()

function getDefaultTimezone(): string {
  return select_most_popular_timezone.get() || config.default_timezone
}

let year_zero = new Date(0).getFullYear()
let year_thousand = year_zero + 1000

function autoFixTimestamp(time: number | Date): Date {
  if (typeof time !== 'number') {
    return time
  }
  let date = new Date(time)
  let year = date.getFullYear()
  if (year === year_zero) {
    console.trace('auto fix timestamp by 1000x')
    date.setTime(date.getTime() * 1000)
  } else if (year > year_thousand) {
    console.trace('auto fix timestamp by 1/1000x')
    date.setTime(date.getTime() / 1000)
  }
  return date
}

export function toLocaleDateTimeString(
  time: number | Date,
  context: Context,
  options: LocaleDateTimeFormatOptions = DefaultLocaleDateTimeFormatOptions,
): string {
  let locales: string | undefined = getContextLanguage(context)
  let timeZone: string | undefined = getContextTimezone(context)
  let defaultLocale: string | undefined
  let defaultTimeZone: string | undefined
  for (;;) {
    try {
      let date = autoFixTimestamp(time)
      return date.toLocaleString(locales, {
        ...options,
        timeZone,
      })
    } catch (error) {
      let errorMessage = String(error)
      if (errorMessage.includes('time zone')) {
        log('invalid timezone:', timeZone)
        defaultTimeZone ||= getDefaultTimezone()
        if (timeZone === defaultTimeZone) {
          timeZone = undefined
        } else {
          timeZone = defaultTimeZone
        }
        continue
      }
      if (errorMessage.includes('locale')) {
        if (locales && locales.includes(';')) {
          // e.g. "en;q=0.9"
          locales = locales.split(';')[0]
          continue
        }
        log('invalid locale:', locales)
        defaultLocale ||= getDefaultLocale()
        if (locales === defaultLocale) {
          locales = undefined
        } else {
          locales = defaultLocale
        }
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
        let context = sessionToContext(session, session.url || '?')
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

export type StartRelativeTimer = ReturnType<
  typeof createRelativeTimer
>['startRelativeTimer']

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
        Math.min(MaxTimeoutInterval, lastInterval - (diff % lastInterval)),
      ]
    }
    if (diff === interval) {
      return [
        '1 ' + unit,
        Math.min(MaxTimeoutInterval, interval - (diff % interval)),
      ]
    }
    lastInterval = interval
    lastUnit = unit
  }
  return null
}

// timeout interval must fit into a 32-bit signed integer
const MaxTimeoutInterval = 2147483647

function toTime(time: number | Date): number {
  if (typeof time === 'number') return time
  return time.getTime()
}

function toDate(time: number | Date): Date {
  if (typeof time === 'number') return new Date(time)
  return time
}

export default DateTimeText
