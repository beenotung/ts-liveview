import { format_time_duration } from '@beenotung/tslib'
import { filter, find } from 'better-sqlite3-proxy'
import { db } from './db.js'
import { proxy, RequestLog } from './proxy.js'
import { debugLog } from '../server/debug.js'

let log = debugLog('user-agent')
log.enabled = true

function classifyUserAgent(ua: string) {
  if (ua.startsWith('TelegramBot')) return { bot: 'TelegramBot' }
  else if (ua.startsWith('WhatsApp')) return { bot: 'WhatsAppBot' }
  else if (ua.startsWith('AnyConnect')) return { bot: 'CiscoAnyConnect' }
  else if (ua.startsWith('python-requests')) return { bot: 'PythonRequests' }
  else if (ua.includes('http://help.yahoo.com/help/us/ysearch/slurp'))
    return { bot: 'YahooBot' }
  else if (ua.includes('https://neeva.com/neevabot')) return { bot: 'NeevaBot' }
  else if (ua.includes('www.bing.com/bingbot')) return { bot: 'BingBot' }
  else if (ua.includes('paloaltonetworks.com')) return { bot: 'PaloBot' }
  else if (ua.includes('https://nmap.org/book/nse.html')) return { bot: 'Nmap' }
  else if (ua.includes('info@netcraft.com'))
    return { bot: 'NetcraftSurveyAgent' }
  else if (ua.includes('https://webmaster.petalsearch.com/site/petalbot'))
    return { bot: 'PetalBot' }
  else if (ua.includes('https://www.qwant.com/')) return { bot: 'QwantBot' }
  else if (ua.includes('http://mj12bot.com/')) return { bot: 'MJ12Bot' }
  else if (ua.includes('https://babbar.tech/crawler'))
    return { bot: 'BarkrowlerBot' }
  else if (ua.includes('http://webmeup-crawler.com/')) return { bot: 'BLEXBot' }
  else if (ua.includes('http://www.linkdex.com/bots/'))
    return { bot: 'LinkdexBot' }
  else if (ua.includes('https://opensiteexplorer.org/dotbot'))
    return { bot: 'DotBot' }
  else if (ua.includes('http://ahrefs.com/robot/')) return { bot: 'AhrefsBot' }
  else if (ua.includes('http://www.google.com/bot.html'))
    return { bot: 'GoogleBot' }
  else if (ua.includes('Googlebot-Image')) return { bot: 'GoogleBot' }
  else if (ua.includes('http://duckduckgo.com')) return { bot: 'DuckDuckGoBot' }
  else if (ua.includes('http://yandex.com/bots')) return { bot: 'YandexBot' }
  else if (ua.includes('https://about.censys.io'))
    return { bot: 'CensysInspect' }
  else if (ua.includes('crawler@mixrank.com')) return { bot: 'MixrankBot' }
  else if (ua.includes('facebookexternalhit')) return { bot: 'FacebookBot' }
  else if (ua.includes('http://www.semrush.com/bot.html'))
    return { bot: 'SemrushBot' }
  else if (ua.includes('https://internet-measurement.com'))
    return { bot: 'InternetMeasurement' }
  else if (ua.includes('https://dataforseo.com/dataforseo-bot'))
    return { bot: 'DataForSeoBot' }
  else if (ua.includes('iPhone')) return { type: 'iPhone' }
  else if (ua.includes('iPad')) return { type: 'iPad' }
  else if (ua.includes('Macintosh')) return { type: 'MacOS' }
  else if (ua.includes('KFAPWI')) return { type: 'Kindle' }
  else if (ua.includes('curl')) return { type: 'curl' }
  else if (ua.includes('Wget')) return { type: 'Wget' }
  else if (ua.includes('Lynx')) return { type: 'Lynx' }
  else if (ua.includes('Links')) return { type: 'Links' }
  else if (ua.includes('Android') || ua.includes('Nokia'))
    return { type: 'Android' }
  else if (ua.includes('X11; CrOS x86_64')) return { type: 'ChromeOS' }
  else if (ua.includes('Windows')) return { type: 'Windows' }
  else if (ua.includes('Linux')) return { type: 'Linux' }
  else return { type: 'Other' }
}

let timePerLog = 1

export function getUAStatsProgress(): string {
  let i = proxy.ua_stat[1]?.last_request_log_id || 0
  let n = proxy.request_log.length

  if (i === n) {
    return 'stats ready'
  }

  let p = ((100 * i) / n).toFixed(3)

  let remainBatch = (n - i) / batchSize
  let remainTime = remainBatch * (interval + batchSize * timePerLog)
  let eta = format_time_duration(remainTime)

  let msg = `stats progress: ${i}/${n} (${p}%) | ETA: ${eta}`
  return msg
}

let ua_type_cache = new Map<string, number>()
function getUaTypeId(type: string): number {
  let id = ua_type_cache.get(type)
  if (id) return id
  id =
    find(proxy.ua_type, { name: type })?.id ||
    proxy.ua_type.push({ name: type, count: 0 })
  ua_type_cache.set(type, id)
  return id
}

let ua_bot_cache = new Map<string, number>()
function getUaBotId(bot: string): number {
  let id = ua_bot_cache.get(bot)
  if (id) return id
  id =
    find(proxy.ua_bot, { name: bot })?.id ||
    proxy.ua_bot.push({ name: bot, count: 0 })
  ua_bot_cache.set(bot, id)
  return id
}

let ua_stat = proxy.ua_stat[1]
if (!ua_stat) {
  proxy.ua_stat[1] = { last_request_log_id: 0 }
  ua_stat = proxy.ua_stat[1]
}
let last_request_log_id = ua_stat.last_request_log_id

let reset_stats_part_1 = db.prepare(/* sql */ `
update user_agent
set count = 0
  , ua_type_id = null
  , ua_bot_id = null
`)

let reset_stats_part_2 = db.prepare('update ua_type set count = 0')
let reset_stats_part_3 = db.prepare('update ua_bot set count = 0')

let _resetStats = db.transaction(() => {
  reset_stats_part_1.run()
  reset_stats_part_2.run()
  reset_stats_part_3.run()
  ua_stat.last_request_log_id = last_request_log_id = 0
})

// _resetStats() // TODO remove after dev

let other_type_id = getUaTypeId('Other')

export function getOtherUserAgents() {
  return filter(proxy.user_agent, { ua_type_id: other_type_id })
}

function stepRequestLogStats(log: RequestLog) {
  let ua = log.user_agent
  if (!ua) return

  ua.count++

  let user_agent = ua.user_agent
  if (!user_agent) return

  let match = classifyUserAgent(user_agent)
  let bot = match.bot
  let type = match.bot ? 'Bots' : match.type

  if (type) {
    if (!ua.ua_type_id) {
      let type_id = getUaTypeId(type)
      ua.ua_type_id = type_id
    }
    ua.ua_type!.count++
  }

  if (bot) {
    if (!ua.ua_bot_id) {
      let bot_id = getUaBotId(bot)
      ua.ua_bot_id = bot_id
    }
    ua.ua_bot!.count++
  }
}

let batchSize = 200
const interval = 1000
const maxBatchTime = 200

const batchStepRequestLogStats = db.transaction(() => {
  let startTime = Date.now()
  for (let i = 0; i < batchSize; i++) {
    last_request_log_id++
    let request_log = proxy.request_log[last_request_log_id]
    if (!request_log) {
      ua_stat.last_request_log_id = last_request_log_id - 1
      log(`\n  finished batchStepRequestLogStats\n`)
      return
    }
    stepRequestLogStats(request_log)
  }
  ua_stat.last_request_log_id = last_request_log_id

  let batchTime = Date.now() - startTime
  timePerLog = timePerLog * 0.5 + (batchTime / batchSize) * 0.5
  if (batchTime > maxBatchTime) {
    batchSize = Math.floor(batchSize / 2) + 1
  } else if (batchTime < maxBatchTime / 2) {
    batchSize = batchSize * 2
  } else {
    batchSize = Math.floor(batchSize * 1.5)
  }

  process.stdout.write(
    `\r  ${getUAStatsProgress()} | batch size: ${batchSize} | batch time: ${batchTime}  `,
  )

  setTimeout(batchStepRequestLogStats, interval)
})

log('start batchStepRequestLogStats...')
setTimeout(batchStepRequestLogStats)

export let checkNewRequestLog = db.transaction((log_id: number) => {
  if (log_id !== last_request_log_id + 1) return
  last_request_log_id++
  let request_log = proxy.request_log[log_id]
  stepRequestLogStats(request_log)
  ua_stat.last_request_log_id = last_request_log_id
})
