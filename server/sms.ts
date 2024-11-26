import { to_full_hk_mobile_phone } from '@beenotung/tslib/validate.js'
import { env } from './env.js'
import { HttpError } from './exception.js'
import { debugLog } from './debug.js'

let log = debugLog('sms.ts')
log.enabled = true

export async function sendSMS(options: {
  from: string
  /** @description hk tel number */
  to: string
  text: string
}) {
  let text = options.text.trim()
  if (!text) {
    throw new HttpError(500, 'missing sms text')
  }
  let tel = options.to.trim()
  if (!tel) {
    throw new HttpError(400, 'missing sms tel')
  }
  tel = to_full_hk_mobile_phone(tel)
  tel = tel.replace('+', '')
  if (!tel) {
    throw new HttpError(400, 'invalid sms tel: ' + options.to)
  }
  if (env.SMS_ACCOUNT_KEY === 'skip') {
    log('sendSMS:', options)
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      async text() {
        return 'mock-sms-response'
      },
    }
  }
  const url = `https://api.wavecell.com/sms/v1/${env.SMS_ACCOUNT_KEY}/single`
  return fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.SMS_API_KEY,
    },
    body: JSON.stringify({
      source: options.from,
      destination: tel,
      text,
    }),
  })
}
