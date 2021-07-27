import { config as loadEnv } from 'dotenv'

loadEnv()

export let config = {
  production:
    process.env.NODE_ENV === 'production' || process.argv[2] === '--prod',
  development:
    process.env.NODE_ENV === 'development' || process.argv[2] === '--dev',
  port: +process.env.PORT! || 8100,
  require_https: true,
}

if (process.env.BEHIND_HTTPS_PROXY === 'true') {
  config.require_https = false
} else {
  config.require_https = config.production
}
