import { config as loadEnv } from 'dotenv'
import { populateEnv } from 'populate-env'

loadEnv()

let env = {
  NODE_ENV: 'development',
  PORT: 8100,
  BEHIND_HTTPS_PROXY: 'false',
  COOKIE_SECRET: '',
}

populateEnv(env, { mode: 'halt' })

export let config = {
  production: env.NODE_ENV === 'production' || process.argv[2] === '--prod',
  development: env.NODE_ENV === 'development' || process.argv[2] === '--dev',
  port: env.PORT,
  require_https: true,
  cookie_secret: env.COOKIE_SECRET,
}

if (env.BEHIND_HTTPS_PROXY === 'true') {
  config.require_https = false
} else {
  config.require_https = config.production
}
