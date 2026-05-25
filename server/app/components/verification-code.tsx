import { config } from '../../config.js'
import type { Context } from '../context.js'
import { nodeToHTML } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'

export function verificationCodeEmail(
  attrs: { passcode: string },
  context: Context,
) {
  let node = (
    <>
      <p>
        <code>{attrs.passcode}</code> is your verification code.
      </p>
      <p>
        All you have to do is copy the code above and paste it to the form to
        complete the email verification process.
      </p>
      <p>
        If you did not request to authenticate on {config.site_name} (
        {config.short_site_name} in short), it is safe to ignore this email.
      </p>
    </>
  )
  let html = nodeToHTML(node, context)
  let text = `
${attrs.passcode} is your verification code.

All you have to do is copy the code above and paste it to the form to complete the email verification process.

If you did not request to authenticate on ${config.site_name} (${config.short_site_name} in short), it is safe to ignore this email.
`.trim()
  return { html, text }
}

export function verificationCodeSMS(attrs: { passcode: string }) {
  return `
${attrs.passcode} is your verification code.

If you did not request to authenticate on ${config.short_site_name}, it is safe to ignore this message.
`.trim()
}
