import { Random, digits } from '@beenotung/tslib/random.js'
import { MINUTE } from '@beenotung/tslib/time.js'
import { db } from '../../../db/db.js'
import { HttpError } from '../../http-error.js'
import { proxy } from '../../../db/proxy.js'
import { email, object, string } from 'cast.ts'
import { sendEmail } from '../../email.js'
import { config, title } from '../../config.js'
import { Context, DynamicContext, getContextFormBody } from '../context.js'
import { Routes, StaticPageRoute } from '../routes.js'
import { o } from '../jsx/jsx.js'
import { Link, Redirect } from '../components/router.js'
import { nodeToHTML } from '../jsx/html.js'
import NotImplemented from './not-implemented.js'
import Style from '../components/style.js'
import { Node } from '../jsx/types.js'
import { renderError } from '../components/error.js'
import { debugLog } from '../../debug.js'

let log = debugLog('app:verification-code')
log.enabled = true

export const PasscodeLength = 6
export const PasscodeRegex = /[0-9]{6}/
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

let requestEmailVerificationParser = object({
  email: email(),
})

async function requestEmailVerification(
  context: DynamicContext,
): Promise<StaticPageRoute> {
  try {
    let body = getContextFormBody(context)
    let input = requestEmailVerificationParser.parse(body, { name: 'body' })
    let search = context.routerMatch?.search
    let include_link = search && new URLSearchParams(search).has('include_link')

    let passcode = generatePasscode()
    let request_time = Date.now()
    proxy.verification_code.push({
      passcode,
      email: input.email,
      request_time,
    })
    let { html, text } = verificationCodeEmail(
      { passcode, email: include_link ? input.email : null },
      context,
    )
    let info = await sendEmail({
      from: config.email.auth.user,
      to: input.email,
      subject: title('Email Verification'),
      html,
      text,
    })
    if (info.accepted[0] === input.email) {
      log('sent passcode email to:', input.email)
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
    ? config.origin +
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
#verifyEmailPage  form .field input {
  margin: 0.25rem 0;
}
`)

function VerifyEmailPage(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  return (
    <div id="verifyEmailPage">
      {style}
      <h1>Email Verification</h1>
      {error ? (
        <>
          <p>Failed to send verification code to your email.</p>
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
      )}
    </div>
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
            style={`width: ${email?.length}ch`}
          />
        }
      />
      <Field
        label="Verification code"
        input={
          <input
            style="font-family: monospace; width: 6ch; padding: 0.5ch"
            minlength={PasscodeLength}
            maxlength={PasscodeLength}
            inputmode="numeric"
            name="code"
            placeholder={'x'.repeat(PasscodeLength)}
            required
            value={code || ''}
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
  try {
  } catch (error) {}
  return {
    title: title('Email Verification'),
    description:
      'API Endpoint to submit email verification code for authentication',
    node: <Redirect href="/verify" />,
  }
}

let routes: Routes = {
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
    title: title('Email Verification'),
    description: 'API Endpoint to submit email verification code',
    streaming: false,
    node: NotImplemented,
  },
  '/verify/email/code/result': {
    title: title('Email Verification'),
    description: 'Submit result of email verification code for authentication',
    node: NotImplemented,
  },
}

export default { routes }
