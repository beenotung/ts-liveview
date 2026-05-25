import nodemailer, { SendMailOptions, createTransport } from 'nodemailer'
import { env } from './env.js'

let transport = createTransport({
  service: env.EMAIL_SERVICE,
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
})

export async function sendEmail(
  options: SendMailOptions,
): Promise<nodemailer.SentMessageInfo> {
  let info = await transport.sendMail(options)
  return info
}
