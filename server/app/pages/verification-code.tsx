import { Random, digits } from '@beenotung/tslib/random.js'
import { MINUTE } from '@beenotung/tslib/time.js'
import { db } from '../../../db/db.js'
import { HttpError } from '../../exception.js'
import { proxy } from '../../../db/proxy.js'
import { boolean, email, object, optional, string } from 'cast.ts'
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
import { filter, find } from 'better-sqlite3-proxy'
import { writeUserIdToCookie } from '../auth/user.js'
import { env } from '../../env.js'

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

function generatePasscode(): string {
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

let requestEmailVerificationParser = object({
  email: email(),
  include_link: optional(boolean()),
})

async function requestEmailVerification(
  context: DynamicContext,
): Promise<StaticPageRoute> {
  try {
    let body = getContextFormBody(context)
    let input = requestEmailVerificationParser.parse(body, { name: 'body' })

    let passcode = generatePasscode()
    let request_time = Date.now()
    proxy.verification_code.push({
      passcode,
      email: input.email,
      request_time,
      revoke_time: null,
      match_id: null,
      user_id: find(proxy.user, { email: input.email })?.id || null,
    })
    let { html, text } = verificationCodeEmail(
      { passcode, email: input.include_link ? input.email : null },
      context,
    )
    let info = await sendEmail({
      from: env.EMAIL_USER,
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
          href={
            '/verify/email/result?' +
            new URLSearchParams({ email: input.email })
          }
        />
      ),
    }
  } catch (error) {
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
}

function verificationCodeEmail(
  attrs: { passcode: string; email: string | null },
  context: Context,
) {
  let url = attrs.email
    ? env.ORIGIN +
      '/verify/email/result?' +
      new URLSearchParams({
        code: attrs.passcode,
        email: attrs.email,
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
  let text = `
${attrs.passcode} is your verification code.

To complete the email verification process, please copy the code above and paste it to the form.

If you did not request to authenticate on ${config.site_name} (${config.short_site_name} in short), it is safe to ignore this email.
`.trim()
  return { html, text }
}

function verificationCodeSMS(attrs: { passcode: string }) {
  return `
${attrs.passcode} is your verification code.

If you did not request to authenticate on ${config.short_site_name}, it is safe to ignore this message.
`.trim()
}

let style = Style(/* css */ `
#verifyEmailPage form .field {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}
#verifyEmailPage form .field input {
  margin: 0.25rem 0;
}
`)

function VerifyEmailPage(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let title = params.get('title')
  let pageTitle = 'Email Verification'
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

      <VerifyEmailForm params={params} />
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
function VerifyEmailForm(attrs: { params: URLSearchParams }) {
  let { params } = attrs
  let email = params.get('email')
  let code = params.get('code')
  return (
    <form method="post" action="/verify/email/code/submit">
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

let count_attempts_by_email = db
  .prepare(
    /* sql */ `
with verification_code_id as (
select id
from verification_code
where email = :email
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

let revoke_verification_code_by_email = db.prepare(/* sql */ `
update verification_code
set revoke_time = :revoke_time
where email = :email
  and revoke_time is null
`)

let checkEmailVerificationCodeParser = object({
  email: email(),
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
  let email: string | null = null
  try {
    let body = getContextFormBody(context)
    let input = checkEmailVerificationCodeParser.parse(body)
    email = input.email

    let is_too_much_attempt = false
    let is_expired = false
    let user_id: number | null = null

    db.transaction(() => {
      let now = Date.now()

      let attempt_id = proxy.verification_attempt.push({
        passcode: input.code,
        email: input.email,
      })

      let attempts = count_attempts_by_email.get({ email }) as number
      if (attempts > MaxPasscodeInputAttempt) {
        is_too_much_attempt = true
        revoke_verification_code_by_email.run({ email, revoke_time: now })
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
          find(proxy.user, { email: input.email })?.id ||
          proxy.user.push({
            email: input.email,
            username: null,
            password_hash: null,
            tel: null,
            avatar: null,
          })
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
    if (email) params.set('email', email)
    return {
      title: apiEndpointTitle,
      description:
        'API Endpoint to submit email verification code for authentication',
      node: <Redirect href={'/verify/email/result?' + params} />,
    }
  }
}

let routes = {
  '/verify/email/submit': {
    streaming: false,
    resolve: requestEmailVerification,
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
} satisfies Routes

export default { routes }
