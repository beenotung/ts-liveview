import { env } from './env.js'

let production = env.NODE_ENV === 'production'
let development = env.NODE_ENV === 'development'

function fixEpoch() {
  // workaround of initial build twice since esbuild v0.17
  if (env.EPOCH >= 2) {
    return env.EPOCH - 1
  }
  return env.EPOCH
}

let epoch = fixEpoch()

export let config = {
  production,
  development,
  site_name: 'ts-liveview',
  site_description: 'Demo website of ts-liveview',
  setup_robots_txt: false,
  epoch,
  auto_open: !production && development && epoch === 1,
  client_target: 'es2020',
}

const titleSuffix = ' | ' + config.site_name

export function title(page: string) {
  return page + titleSuffix
}

export let apiEndpointTitle = title('API Endpoint')
