import { config as loadEnv } from 'dotenv'
import { populateEnv } from 'populate-env'
import { cwd } from 'process'

loadEnv()

export let env = {
  NODE_ENV: 'development' as 'development' | 'production',
  PORT: 8100,
  COOKIE_SECRET: '',
  EPOCH: 1, // to distinct initial run or restart in serve mode
  UPLOAD_DIR: 'uploads',
  EMAIL_SERVICE: 'google',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: '',
  EMAIL_PASSWORD: '',
  ORIGIN: '',
}
applyDefaultEnv()

function applyDefaultEnv() {
  if (process.env.NODE_ENV === 'production') return
  env.COOKIE_SECRET ||= process.env.COOKIE_SECRET || cwd()
}

populateEnv(env, { mode: 'halt' })
