import { Random, digits } from '@beenotung/tslib/random.js'
import { MINUTE } from '@beenotung/tslib/time.js'
import { Router } from 'express'
import { db } from '../../../db/db.js'
import { HttpError } from '../../http-error.js'
import { proxy } from '../../../db/proxy.js'
import { email, object } from 'cast.ts'
import { sendEmail } from '../../email.js'
import { config, title } from '../../config.js'
import {
  Context,
  DynamicContext,
  ExpressContext,
  getContextFormBody,
} from '../context.js'
import { verificationCodeEmail } from '../components/verification-code.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { Verify } from 'crypto'
import { o } from '../jsx/jsx.js'
import { Redirect } from '../components/router.js'

export const PasscodeLength = 6
export const PasscodeExpireDuration = 5 * MINUTE
const MaxAttempt = 1e6

let cleanup_passcode = db.prepare(/* sql */ `
delete from verification_code
where request_time <= :request_time
`)

let check_passcode_clash = db
  .prepare(
    /* sql */ `
select count(id) as count
from verification_code
where request_time > :request_time
  and passcode = :passcode
`,
  )
  .pluck()

function generatePasscode(): string {
  for (let i = 0; i < MaxAttempt; i++) {
    let passcode = Random.nextString(PasscodeLength, digits)

    // skip passcode with leading zero
    if (String(+passcode) !== passcode) continue

    // retry if clash with active passcode
    let count = check_passcode_clash.get({
      request_time: Date.now() - PasscodeExpireDuration,
      passcode,
    }) as number
    if (count > 0) continue

    return passcode
  }
  throw new HttpError(503, 'passcode pool is full')
}

export async function requestEmailVerification(
  input: { email: string },
  context: Context,
) {
  let passcode = generatePasscode()
  let request_time = Date.now()
  proxy.verification_code.push({
    passcode,
    email: input.email,
    request_time,
  })
  let { html, text } = verificationCodeEmail({ passcode }, context)
  let info = await sendEmail({
    from: config.email.auth.user,
    to: input.email,
    subject: title('Email Verification'),
    html,
    text,
  })
  if (info.accepted[0] === input.email) {
    console.log('sent email successfully')
  } else {
    console.log('failed to send email?')
    console.log('send email info:')
    console.dir(info, { depth: 20 })
  }
  let expire_time = request_time + PasscodeExpireDuration
  return { expire_time }
}

let verifyEmailParser = object({
  email: email(),
})

function VerifyEmail(attrs: {}, context: DynamicContext) {
  return (
    <div>
      <p>Please check your inbox and spam folder.</p>
    </div>
  )
}

let routes: Routes = {
  '/verify/email': {
    streaming: false,
    async resolve(context): Promise<StaticPageRoute> {
      let body = getContextFormBody(context)
      let input = verifyEmailParser.parse(body, { name: 'body' })
      let json = await requestEmailVerification({ email: input.email }, context)
      return {
        title: title('Email Verification'),
        description: 'API Endpoint to verify email for authentication',
        node: (
          <Redirect
            href={
              '/verify/email/result?' +
              new URLSearchParams({
                expire_time: json.expire_time.toString(),
              })
            }
          />
        ),
      }
    },
  },
  '/verify/email/result': {
    title: title('Email Verification'),
    description: 'Result page of email verification for authentication',
    node: <VerifyEmail />,
  },
}

export default { routes }
