import { config as loadEnv } from 'dotenv'
import { populateEnv } from 'populate-env'
import { cwd } from 'process'

loadEnv()

export let env = {
  NODE_ENV: 'development' as 'development' | 'production',
  CADDY_PROXY: 'skip' as 'skip' | 'enable',
  PORT: 8100,
  COOKIE_SECRET: '',
  EPOCH: 1, // to distinct initial run or restart in serve mode
  UPLOAD_DIR: 'uploads',
  ORIGIN: '',
}
applyDefaultEnv()

function applyDefaultEnv() {
  if (process.env.NODE_ENV === 'production') return
  let PORT = process.env.PORT || env.PORT
  env.ORIGIN ||= process.env.ORIGIN || `http://localhost:${PORT}`
  env.COOKIE_SECRET ||= process.env.COOKIE_SECRET || cwd()
}

populateEnv(env, { mode: 'halt' })

if (env.CADDY_PROXY.toLocaleLowerCase().startsWith('enable')) {
  env.CADDY_PROXY = 'enable'
} else {
  env.CADDY_PROXY = 'skip'
}
