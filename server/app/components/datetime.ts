import { format_datetime } from '@beenotung/tslib/format.js'
import { getContext } from '../context.js'
import { getWSSession } from '../session.js'
import { debugLog } from '../../debug.js'

let log = debugLog('datetime.tsx')
log.enabled = true

export function DateTimeText(attrs: { time: number }) {
  let context = getContext(attrs)
  let locales: string | undefined
  let timeZone: string | undefined
  if (context.type === 'express') {
    locales = context.req.headers['accept-language']
      ?.split(',')[0]
      .replace('_', '-')
  } else if (context.type === 'ws') {
    let session = getWSSession(context.ws)
    locales = session.locales
    timeZone = session.timeZone
  }
  for (;;) {
    try {
      return format_datetime(attrs.time, { locales, timeZone })
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
