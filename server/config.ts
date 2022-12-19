import { config as loadEnv } from 'dotenv'
import { readFileSync } from 'fs'
import { populateEnv } from 'populate-env'
import { ServerOptions } from 'spdy-fixes'

loadEnv()

let env = {
  NODE_ENV: 'development',
  PORT: 8100,
  BEHIND_HTTPS_PROXY: 'false',
  COOKIE_SECRET: ' ',
  // you can generate the cert file for local development with `mkcert -install && mkcert localhost`
  // for production deployment, you can use `certbot` (potentially with nginx plugin)
  HTTPS_KEY_FILE: 'localhost-key.pem',
  HTTPS_CERT_FILE: 'localhost.pem',
  HTTP_VERSION: 2, // 1 or 2
}

populateEnv(env, { mode: 'halt' })

let behind_proxy = env.BEHIND_HTTPS_PROXY === 'true'

let serverOptions: ServerOptions =
  behind_proxy || env.HTTP_VERSION !== 2
    ? {
        spdy: {
          plain: true,
        },
      }
    : {
        key: readFileSync(env.HTTPS_KEY_FILE),
        cert: readFileSync(env.HTTPS_CERT_FILE),
      }

let production = env.NODE_ENV === 'production' || process.argv[2] === '--prod'
let development = env.NODE_ENV === 'development' || process.argv[2] === '--dev'

if (production && env.COOKIE_SECRET == ' ') {
  console.error('Missing COOKIE_SECRET in env')
  process.exit(1)
}

export let config = {
  production,
  development,
  port: env.PORT,
  require_https: !behind_proxy && production,
  behind_proxy,
  cookie_secret: env.COOKIE_SECRET,
  site_name: 'ts-liveview Demo',
  site_description: 'Demo website of ts-liveview',
  setup_robots_txt: false,
  serverOptions,
}
