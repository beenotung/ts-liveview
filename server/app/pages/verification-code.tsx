import { Random, digits } from '@beenotung/tslib/random.js'
import { MINUTE } from '@beenotung/tslib/time.js'
import { db } from '../../../db/db.js'
import { EarlyTerminate, HttpError, MessageException } from '../../exception.js'
import { proxy } from '../../../db/proxy.js'
import { boolean, email, literal, object, optional, or, string } from 'cast.ts'
import { sendEmail } from '../../email.js'
import { LayoutType, apiEndpointTitle, config, title } from '../../config.js'
import {
  Context,
  DynamicContext,
  ExpressContext,
  getContextFormBody,
} from '../context.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { o } from '../jsx/jsx.js'
import { Link, Redirect } from '../components/router.js'
import { nodeToHTML } from '../jsx/html.js'
import Style from '../components/style.js'
import { Node } from '../jsx/types.js'
import { renderError } from '../components/error.js'
import { debugLog } from '../../debug.js'
import { count, filter, find } from 'better-sqlite3-proxy'
import { getAuthUser, writeUserIdToCookie } from '../auth/user.js'
import { env } from '../../env.js'
import { randomUUID } from 'crypto'
import { sendSMS } from '../../sms.js'
import { to_full_hk_mobile_phone } from '@beenotung/tslib/validate.js'
import { formatTel } from '../components/tel.js'

let log = debugLog('app:verification-code')
log.enabled = true

export const PasscodeLength = 6
export const PasscodeRegex = /[0-9]{6}/
export const PasscodeExpireDuration = 5 * MINUTE
const MaxPasscodeInputAttempt = 5
const MaxPasscodeGenerationAttempt = 1e6

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

export function generatePasscode(): string {
  for (let i = 0; i < MaxPasscodeGenerationAttempt; i++) {
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

let requestVerificationParser = object({
  email: optional(or([literal(''), email()])),
  tel: optional(string()),
  include_link: optional(boolean()),
})

async function requestVerification(
  context: DynamicContext,
): Promise<StaticPageRoute> {
  let mode: 'email' | 'sms' | null = null
  try {
    let body = getContextFormBody(context)
    let input = requestVerificationParser.parse(body, { name: 'body' })

    let email = input.email || null
    let tel = input.tel || null

    if (!email && !tel) {
      throw 'email or tel is required'
    }

    mode = email ? 'email' : 'sms'

    if (tel) {
      tel = to_full_hk_mobile_phone(tel)
      if (!tel) {
        throw 'not a valid HK mobile phone number'
      }
    }

    let authUser = getAuthUser(context)
    if (email) {
      mode = 'email'
      if (authUser && authUser.email != email) {
        // changing email, check if the new email is already registered
        if (count(proxy.user, { email })) {
          throw 'this email is already registered by another account'
        }
      }
    }
    if (tel) {
      mode = 'sms'
      if (authUser && authUser.tel != tel) {
        // changing tel, check if the new tel is already registered
        if (count(proxy.user, { tel })) {
          throw 'this phone number is already registered by another account'
        }
      }
    }

    function getUserId(): number | null {
      if (authUser) return authUser.id!
      if (email) return find(proxy.user, { email })?.id || null
      if (tel) return find(proxy.user, { tel })?.id || null
      return null
    }

    let uuid = randomUUID()
    let passcode = generatePasscode()
    let request_time = Date.now()
    proxy.verification_code.push({
      passcode,
      uuid,
      email,
      tel,
      request_time,
      revoke_time: null,
      match_id: null,
      user_id: getUserId(),
    })

    async function sendByEmail(): Promise<StaticPageRoute> {
      let { html, text } = verificationCodeEmail(
        { passcode, uuid, include_link: input.include_link || false },
        context,
      )
      let info = await sendEmail({
        from: `${config.site_name} <${env.EMAIL_USER}>`,
        to: input.email,
        subject: title('Email Verification'),
        html,
        text,
      })
      if (info.accepted[0] === input.email) {
        log('sent passcode email to:', input.email)
        if (
          env.EMAIL_USER == 'skip' &&
          context.type == 'ws' &&
          env.ORIGIN.includes('localhost')
        ) {
          context.ws.send([
            'eval',
            `alert('[dev] verification code: ${passcode}')`,
          ])
        }
      } else {
        log('failed to send email?')
        log('send email info:')
        console.dir(info, { depth: 20 })
        throw new HttpError(502, info.response)
      }
      return {
        title: title('Email Verification'),
        description:
          'API Endpoint to request email verification code for authentication',
        node: (
          <Redirect
            href={'/verify/email/result?' + new URLSearchParams({ uuid })}
          />
        ),
      }
    }

    async function sendBySMS(): Promise<StaticPageRoute> {
      if (!input.tel) {
        throw 'missing phone number'
      }
      let text = verificationCodeSMS({
        passcode,
        uuid,
        include_link: input.include_link || false,
      })
      let res = await sendSMS({
        from: config.site_name,
        to: input.tel,
        text,
      })
      if (res.ok) {
        log('sent passcode sms to:', input.tel)
        if (
          env.SMS_ACCOUNT_KEY == 'skip' &&
          context.type == 'ws' &&
          env.ORIGIN.includes('localhost')
        ) {
          context.ws.send([
            'eval',
            `alert('[dev] verification code: ${passcode}')`,
          ])
        }
      } else {
        log('failed to send sms?')
        log('send sms response:')
        let text = await res.text()
        log({ status: res.status, statusText: res.statusText, text })
        throw new HttpError(502, text)
      }
      return {
        title: title('SMS Verification'),
        description:
          'API Endpoint to request sms verification code for authentication',
        node: (
          <Redirect
            href={'/verify/sms/result?' + new URLSearchParams({ uuid })}
          />
        ),
      }
    }

    return mode == 'email' ? await sendByEmail() : await sendBySMS()
  } catch (error) {
    if (error instanceof MessageException) {
      throw error
    }

    if (context.type == 'ws') {
      context.ws.send([
        'eval',
        `showAlert(${JSON.stringify(String(error))},'error')`,
      ])
      throw EarlyTerminate
    }

    if (mode === 'email') {
      return {
        title: title('Email Verification'),
        description:
          'API Endpoint to request email verification code for authentication',
        node: (
          <Redirect
            href={
              '/verify/email/result?' +
              new URLSearchParams({ error: String(error) })
            }
          />
        ),
      }
    }

    if (mode === 'sms') {
      return {
        title: title('SMS Verification'),
        description:
          'API Endpoint to request sms verification code for authentication',
        node: (
          <Redirect
            href={
              '/verify/sms/result?' +
              new URLSearchParams({ error: String(error) })
            }
          />
        ),
      }
    }

    return {
      title: title('Authentication Verification'),
      description:
        'API Endpoint to request verification code for authentication',
      node: (
        <Redirect
          href={
            '/verify/email/result?' +
            new URLSearchParams({ error: String(error) })
          }
        />
      ),
    }
  }
}

export function verificationCodeEmail(
  attrs: {
    uuid: string
    passcode: string
    include_link: boolean
  },
  context: Context,
) {
  let url = attrs.include_link
    ? env.ORIGIN +
      '/verify/email/result?' +
      new URLSearchParams({
        code: attrs.passcode,
        uuid: attrs.uuid,
      })
    : null
  let node = (
    <div style="font-size: 1rem">
      <p>
        <code style="background-color: #eee; padding: 0.25rem; border-radius: 0.25rem">
          {attrs.passcode}
        </code>{' '}
        is your verification code.
      </p>
      <p>
        To complete the email verification process, please copy the code above
        and paste it to the form.
      </p>
      {url ? (
        <p>
          You can also verify your email by opening this link:{' '}
          <a href={url}>{url}</a>
        </p>
      ) : null}
      <p>
        If you did not request to authenticate on {config.site_name} (
        {config.short_site_name} in short), it is safe to ignore this email.
      </p>
    </div>
  )
  let html = nodeToHTML(node, context)
  let site_name =
    config.site_name != config.short_site_name
      ? `${config.site_name} (${config.short_site_name} in short)`
      : config.site_name
  let text = `
${attrs.passcode} is your verification code.

To complete the email verification process, please copy the code above and paste it to the form.

If you did not request to authenticate on ${site_name}, it is safe to ignore this email.
`.trim()
  return { html, text }
}

export function verificationCodeSMS(attrs: {
  uuid: string
  passcode: string
  include_link: boolean
}): string {
  let url = attrs.include_link
    ? env.ORIGIN +
      '/verify/sms/result?' +
      new URLSearchParams({
        code: attrs.passcode,
        uuid: attrs.uuid,
      })
    : null
  let text = `${attrs.passcode} is your verification code.`
  if (url) {
    text += '\n\n' + url
  }
  text += `\n\nIf you did not request to authenticate on ${config.site_name}, it is safe to ignore this message.`
  return text
}

let style = Style(/* css */ `
form .field {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}
form .field input {
  margin: 0.25rem 0;
}
`)

function VerifyEmailPage(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let title = params.get('title')
  let pageTitle = 'Email Verification'
  let code = params.get('code')
  let uuid = params.get('uuid')
  let email = uuid ? find(proxy.verification_code, { uuid })?.email : null
  if (!email) {
    error ||= 'invalid verification link'
  }
  let node = error ? (
    <>
      <p>{title || 'Failed to send verification code to your email'}.</p>
      {renderError(error, context)}
      <p>
        You can request another verification code in the{' '}
        <Link href="/login">login page</Link> or{' '}
        <Link href="/register">register page</Link>.
      </p>
    </>
  ) : (
    <>
      <p>
        <span style="display: inline-block">
          A verification code is sent to your email address.
        </span>{' '}
        <span style="display: inline-block">
          Please check your inbox and spam folder.
        </span>
      </p>

      <VerifyEmailForm uuid={uuid!} email={email!} code={code} />
    </>
  )
  if (config.layout_type == LayoutType.ionic) {
    return (
      <>
        {style}
        <ion-header>
          <ion-toolbar>
            <ion-title role="heading" aria-level="1">
              {pageTitle}
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content id="verifyEmailPage" class="ion-padding">
          {node}
        </ion-content>
      </>
    )
  }
  return (
    <>
      {style}
      <div id="verifyEmailPage">
        <h1>{pageTitle}</h1>
        {node}
      </div>
    </>
  )
}
function VerifyEmailForm(attrs: {
  uuid: string
  email: string
  code: string | null
}) {
  let { email, code } = attrs
  return (
    <form method="post" action="/verify/email/code/submit">
      <input type="hidden" name="uuid" value={attrs.uuid} />
      <Field
        label="Email"
        input={
          <input
            type="email"
            required
            name="email"
            value={email}
            readonly
            style={email ? `width: ${email.length + 2}ch` : undefined}
          />
        }
      />
      <Field
        label="Verification code"
        input={
          <input
            style={`font-family: monospace; width: ${config.layout_type == LayoutType.ionic ? '8ch' : '6ch'}; padding: 0.5ch`}
            minlength={PasscodeLength}
            maxlength={PasscodeLength}
            inputmode="numeric"
            name="code"
            placeholder={'x'.repeat(PasscodeLength)}
            required
            value={code}
            autocomplete="off"
          />
        }
      />
      <div>
        <input type="submit" value="Verify" />
      </div>
    </form>
  )
}

function VerifySMSPage(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let title = params.get('title')
  let pageTitle = 'SMS Verification'
  let code = params.get('code')
  let uuid = params.get('uuid')
  let tel = uuid ? find(proxy.verification_code, { uuid })?.tel : null
  if (!tel) {
    error ||= 'invalid verification link'
  }
  let node = error ? (
    <>
      <p>{title || 'Failed to send verification code to your phone'}.</p>
      {renderError(error, context)}
      <p>
        You can request another verification code in the{' '}
        <Link href="/login">login page</Link> or{' '}
        <Link href="/register">register page</Link>.
      </p>
    </>
  ) : (
    <>
      <p>
        <span style="display: inline-block">
          A verification code is sent to your phone number.
        </span>{' '}
        <span style="display: inline-block">
          Please check your inbox and spam folder.
        </span>
      </p>

      <VerifySMSForm uuid={uuid!} tel={tel!} code={code} />
    </>
  )
  if (config.layout_type == LayoutType.ionic) {
    return (
      <>
        {style}
        <ion-header>
          <ion-toolbar>
            <ion-title role="heading" aria-level="1">
              {pageTitle}
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content id="verifySMSPage" class="ion-padding">
          {node}
        </ion-content>
      </>
    )
  }
  return (
    <>
      {style}
      <div id="verifySMSPage">
        <h1>{pageTitle}</h1>
        {node}
      </div>
    </>
  )
}
function VerifySMSForm(attrs: {
  uuid: string
  tel: string
  code: string | null
}) {
  let { tel, code } = attrs
  return (
    <form method="post" action="/verify/sms/code/submit">
      <input type="hidden" name="uuid" value={attrs.uuid} />
      <Field
        label="Phone number"
        input={
          <input
            type="tel"
            required
            name="tel"
            value={formatTel(tel)}
            readonly
            style={tel ? `width: ${tel.length + 2}ch` : undefined}
          />
        }
      />
      <Field
        label="Verification code"
        input={
          <input
            style={`font-family: monospace; width: ${config.layout_type == LayoutType.ionic ? '8ch' : '6ch'}; padding: 0.5ch`}
            minlength={PasscodeLength}
            maxlength={PasscodeLength}
            inputmode="numeric"
            name="code"
            placeholder={'x'.repeat(PasscodeLength)}
            required
            value={code}
            autocomplete="off"
          />
        }
      />
      <div>
        <input type="submit" value="Verify" />
      </div>
    </form>
  )
}

function Field(attrs: { label: string; input: Node }) {
  return (
    <div class="field">
      <label>
        {attrs.label}
        <div>{attrs.input}</div>
      </label>
    </div>
  )
}

let count_attempts = db
  .prepare<{ email: string | null; tel: string | null }, number>(
    /* sql */ `
with verification_code_id as (
select id
from verification_code
where (email = :email or tel = :tel)
  and revoke_time is null
order by id desc
limit 1
)
select count(*)
from verification_attempt
inner join verification_code on verification_code.id in (select id from verification_code_id)
where verification_attempt.created_at >= verification_code.created_at
`,
  )
  .pluck()

let revoke_verification_code = db.prepare<{
  email: string | null
  tel: string | null
  revoke_time: number
}>(/* sql */ `
update verification_code
set revoke_time = :revoke_time
where (email = :email or tel = :tel)
  and revoke_time is null
`)

let checkEmailVerificationCodeParser = object({
  uuid: string(),
  email: email(),
  code: string({
    minLength: PasscodeLength,
    maxLength: PasscodeLength,
    match: PasscodeRegex,
  }),
})

let checkSMSVerificationCodeParser = object({
  uuid: string(),
  tel: string(),
  code: string({
    minLength: PasscodeLength,
    maxLength: PasscodeLength,
    match: PasscodeRegex,
  }),
})

async function checkEmailVerificationCode(
  context: DynamicContext,
): Promise<StaticPageRoute> {
  let res = (context as ExpressContext).res
  let uuid: string | null = null
  try {
    let body = getContextFormBody(context)
    let input = checkEmailVerificationCodeParser.parse(body)
    uuid = input.uuid

    let is_too_much_attempt = false
    let is_expired = false
    let user_id: number | null = null

    db.transaction(() => {
      let now = Date.now()

      let attempt_id = proxy.verification_attempt.push({
        passcode: input.code,
        email: input.email,
        tel: null,
      })

      let attempts = count_attempts.get({ email: input.email, tel: null })!
      if (attempts > MaxPasscodeInputAttempt) {
        is_too_much_attempt = true
        revoke_verification_code.run({
          email: input.email,
          tel: null,
          revoke_time: now,
        })
        return
      }

      let verification_code_rows = filter(proxy.verification_code, {
        email: input.email,
        revoke_time: null,
        match_id: null,
      })
      if (verification_code_rows.length == 0) {
        is_expired = true
        return
      }
      for (let verification_code of verification_code_rows) {
        if (verification_code.passcode != input.code) {
          continue
        }
        if (now - verification_code.request_time >= PasscodeExpireDuration) {
          verification_code.revoke_time = now
          is_expired = true
          continue
        }
        verification_code.revoke_time = now
        verification_code.match_id = attempt_id
        user_id =
          verification_code.user_id ||
          find(proxy.user, { email: input.email })?.id ||
          proxy.user.push({
            email: input.email,
            tel: null,
            username: null,
            password_hash: null,
            avatar: null,
            is_admin: null,
            nickname: null,
          })
        // update email after verification
        let user = proxy.user[user_id]
        if (user.email != input.email) {
          user.email = input.email
        }
        break
      }
    })()
    if (!user_id) {
      throw new HttpError(
        400,
        is_too_much_attempt
          ? 'Too much mismatched attempts.'
          : is_expired
            ? 'Verification code expired.'
            : 'Verification code not matched.',
      )
    }
    writeUserIdToCookie(res, user_id)
    return {
      title: apiEndpointTitle,
      description:
        'API Endpoint to submit email verification code for authentication',
      node: <Redirect href="/login?code=ok" />,
    }
  } catch (error) {
    let params = new URLSearchParams({
      title: 'Failed to verify email',
      error: String(error),
    })
    if (uuid) params.set('uuid', uuid)
    return {
      title: apiEndpointTitle,
      description:
        'API Endpoint to submit email verification code for authentication',
      node: <Redirect href={'/verify/email/result?' + params} />,
    }
  }
}

async function checkSMSVerificationCode(
  context: DynamicContext,
): Promise<StaticPageRoute> {
  let res = (context as ExpressContext).res
  let uuid: string | null = null
  try {
    let body = getContextFormBody(context)
    let input = checkSMSVerificationCodeParser.parse(body)
    uuid = input.uuid
    let is_too_much_attempt = false
    let is_expired = false
    let user_id: number | null = null

    let tel = to_full_hk_mobile_phone(input.tel)
    if (!tel) throw new HttpError(400, 'Invalid hk mobile phone number')

    db.transaction(() => {
      let now = Date.now()

      let attempt_id = proxy.verification_attempt.push({
        passcode: input.code,
        email: null,
        tel,
      })

      let attempts = count_attempts.get({ email: null, tel })!
      if (attempts > MaxPasscodeInputAttempt) {
        is_too_much_attempt = true
        revoke_verification_code.run({
          email: null,
          tel,
          revoke_time: now,
        })
        return
      }

      let verification_code_rows = filter(proxy.verification_code, {
        tel,
        revoke_time: null,
        match_id: null,
      })
      if (verification_code_rows.length == 0) {
        is_expired = true
        return
      }
      for (let verification_code of verification_code_rows) {
        if (verification_code.passcode != input.code) {
          continue
        }
        if (now - verification_code.request_time >= PasscodeExpireDuration) {
          verification_code.revoke_time = now
          is_expired = true
          continue
        }
        verification_code.revoke_time = now
        verification_code.match_id = attempt_id
        user_id =
          verification_code.user_id ||
          find(proxy.user, { tel })?.id ||
          proxy.user.push({
            email: null,
            tel,
            username: null,
            password_hash: null,
            avatar: null,
            is_admin: null,
            nickname: null,
          })
        // update tel after verification
        let user = proxy.user[user_id]
        if (user.tel != tel) {
          user.tel = tel
        }
        break
      }
    })()
    if (!user_id) {
      throw new HttpError(
        400,
        is_too_much_attempt
          ? 'Too much mismatched attempts.'
          : is_expired
            ? 'Verification code expired.'
            : 'Verification code not matched.',
      )
    }
    writeUserIdToCookie(res, user_id)
    return {
      title: apiEndpointTitle,
      description:
        'API Endpoint to submit sms verification code for authentication',
      node: <Redirect href="/login?code=ok" />,
    }
  } catch (error) {
    let params = new URLSearchParams({
      title: 'Failed to verify sms',
      error: String(error),
    })
    if (uuid) params.set('uuid', uuid)
    return {
      title: apiEndpointTitle,
      description:
        'API Endpoint to submit sms verification code for authentication',
      node: <Redirect href={'/verify/sms/result?' + params} />,
    }
  }
}

let routes = {
  '/verify/submit': {
    streaming: false,
    resolve: requestVerification,
  },
  '/verify/email/result': {
    title: title('Email Verification'),
    description: 'Input email verification code for authentication',
    node: <VerifyEmailPage />,
  },
  '/verify/email/code/submit': {
    streaming: false,
    resolve: checkEmailVerificationCode,
  },
  '/verify/sms/result': {
    title: title('SMS Verification'),
    description: 'Input SMS verification code for authentication',
    node: <VerifySMSPage />,
  },
  '/verify/sms/code/submit': {
    streaming: false,
    resolve: checkSMSVerificationCode,
  },
} satisfies Routes

export default { routes }
