import { randomUUID } from 'crypto'
import { existsSync } from 'fs'
import { populateEnv, saveEnv } from 'populate-env'
import { loadEnvFile } from 'process'

function getEnvFile() {
  if (process.env.ENV_FILE) {
    return process.env.ENV_FILE
  }
  if (process.env.NODE_ENV && existsSync('.env.' + process.env.NODE_ENV)) {
    return '.env.' + process.env.NODE_ENV
  }
  if (existsSync('.env')) {
    return '.env'
  }
  return null
}
let envFile = getEnvFile()
if (envFile) {
  loadEnvFile(envFile)
}

export let env = {
  NODE_ENV: 'development' as 'development' | 'production',
  CADDY_PROXY: 'skip' as 'skip' | 'enable',
  PORT: 8100,
  COOKIE_SECRET: '',
  EPOCH: 1, // to distinct initial run or restart in serve mode, auto-managed by dev.ts
  UPLOAD_DIR: 'uploads',
  ORIGIN: '',
  FIND_IP_API_KEY: 'skip', // Optional: API key for findip.net geolocation service
  EMAIL_SERVICE: 'google',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: 587,
  EMAIL_USER: '',
  EMAIL_PASSWORD: '',
}
applyDefaultEnv()

function applyDefaultEnv() {
  if (!process.env.COOKIE_SECRET) {
    env.COOKIE_SECRET = randomUUID()
    saveEnv({ env, key: 'COOKIE_SECRET' })
  }
  if (process.env.NODE_ENV === 'production') return
  let PORT = process.env.PORT || env.PORT
  env.ORIGIN ||= process.env.ORIGIN || `http://localhost:${PORT}`
}

populateEnv(env, { mode: 'halt' })

if (env.CADDY_PROXY.toLocaleLowerCase().startsWith('enable')) {
  env.CADDY_PROXY = 'enable'
} else {
  env.CADDY_PROXY = 'skip'
}

if (env.FIND_IP_API_KEY.toLocaleLowerCase() == 'skip') {
  env.FIND_IP_API_KEY = 'skip'
  console.warn('feat: FIND_IP_API_KEY not set, geolocation logging is disabled')
}
