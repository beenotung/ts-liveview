import { DAY, MONTH, YEAR } from '@beenotung/tslib/time.js'
import { Context } from '../context.js'
import { toLocaleDateTimeString } from './datetime.js'
import { Element } from '../jsx/types.js'

export function Time(
  attrs: { time: number; compact?: boolean },
  context: Context,
): Element {
  let { time } = attrs
  let datetime = new Date(time).toISOString()
  let timeStr = toLocaleDateTimeString(time, context)
  let text = attrs.compact
    ? toLocaleDateTimeString(time, context, getCompactTimeOptions(time))
    : timeStr
  return ['time', { datetime, title: timeStr }, [text]]
}

function getCompactTimeOptions(time: number): Intl.DateTimeFormatOptions {
  let now = Date.now()
  let diff = Math.abs(now - time)
  if (diff < DAY / 4)
    return {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }
  if (diff < MONTH)
    return {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  if (diff < YEAR / 4)
    return {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  return {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
}

export default Time
