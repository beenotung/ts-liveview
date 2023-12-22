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

export interface SentMessageInfo {
  accepted: string[]
  rejected: string[]
  response: string // e.g. '250 2.0.0 OK  1703241394 b11-xxxx.299 - gsmtp',
  envelope: { from: string; to: string[] }
  messageId: string
}

export async function sendEmail(options: SendMailOptions) {
  let info = await transport.sendMail(options)
  return info as SentMessageInfo
}
