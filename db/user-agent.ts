export function classifyUserAgent(ua: string) {
  if (ua == 'node' || ua == 'node-fetch' || /^axios\/[\d.]+$/.test(ua))
    return { bot: 'NodeBot' }
  else if (ua.startsWith('HackerNews')) return { bot: 'HackerNewsBot' }
  else if (ua.startsWith('TelegramBot')) return { bot: 'TelegramBot' }
  else if (ua.startsWith('WhatsApp')) return { bot: 'WhatsAppBot' }
  else if (ua.startsWith('Twitterbot')) return { bot: 'TwitterBot' }
  else if (ua.startsWith('AnyConnect')) return { bot: 'CiscoAnyConnect' }
  else if (ua.includes('ImagesiftBot')) return { bot: 'ImagesiftBot' }
  else if (ua.includes('DomainStatsBot')) return { bot: 'DomainStatsBot' }
  else if (ua.startsWith('Akkoma ')) return { bot: 'AkkomaBot' }
  else if (
    ua.startsWith('python-requests') ||
    // e.g. "Python-urllib/3.7"
    /^Python-urllib\/[\d.]+$/.test(ua) ||
    // e.g. "Python/3.10 aiohttp/3.9.0"
    /^Python\/[\d.]+ aiohttp\/[\d.]+$/.test(ua)
  )
    return { bot: 'PythonBot' }
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
  else if (ua.includes('http://webmeup-crawler.com/') || ua.includes('BLEXBot'))
    return { bot: 'BLEXBot' }
  else if (ua.includes('Amazonbot')) return { bot: 'Amazonbot' }
  else if (ua.includes('ClaudeBot')) return { bot: 'ClaudeBot' }
  else if (ua.includes('CCBot') || ua.includes('commoncrawl'))
    return { bot: 'CCBot' }
  else if (ua.includes('coccocbot') || ua.includes('CocCocBot'))
    return { bot: 'coccocbot' }
  else if (ua.includes('https://openai.com/')) return { bot: 'OpenAIBot' }
  else if (ua.includes('http://www.linkdex.com/bots/'))
    return { bot: 'LinkdexBot' }
  else if (ua.includes('https://opensiteexplorer.org/dotbot'))
    return { bot: 'DotBot' }
  else if (ua.includes('http://ahrefs.com/robot/')) return { bot: 'AhrefsBot' }
  else if (ua.includes('http://www.google.com/bot.html'))
    return { bot: 'GoogleBot' }
  else if (ua.includes('Googlebot-Image')) return { bot: 'GoogleBot' }
  else if (ua.includes('Googlebot-News')) return { bot: 'GoogleBot' }
  else if (ua.includes('AdsBot-Google')) return { bot: 'AdsBot-Google' }
  else if (ua.includes('Google-Apps-Script')) return { bot: 'GoogleAppsScript' }
  else if (ua.includes('http://duckduckgo.com')) return { bot: 'DuckDuckGoBot' }
  else if (ua.includes('http://yandex.com/bots')) return { bot: 'YandexBot' }
  else if (ua.includes('http://www.baidu.com')) return { bot: 'BaiduBot' }
  else if (ua.includes('https://www.mojeek.com/bot.html'))
    return { bot: 'MojeekBot' }
  else if (ua.includes('http://napoveda.seznam.cz') || ua.includes('SeznamBot'))
    return { bot: 'SeznamBot' }
  else if (ua.includes('https://about.censys.io'))
    return { bot: 'CensysInspect' }
  else if (ua.includes('crawler@mixrank.com')) return { bot: 'MixrankBot' }
  else if (
    ua.includes('facebookexternalhit') ||
    ua.includes('developers.facebook.com/docs/sharing/webmasters/crawler')
  )
    return { bot: 'FacebookBot' }
  else if (ua.includes('Mastodon')) return { bot: 'MastodonBot' }
  // e.g. "Slack-ImgProxy (+https://api.slack.com/robots)"
  // e.g. "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)"
  else if (ua.includes('https://api.slack.com/robots'))
    return { bot: 'SlackBot' }
  else if (ua.includes('http://www.semrush.com/bot.html'))
    return { bot: 'SemrushBot' }
  else if (ua.includes('https://internet-measurement.com'))
    return { bot: 'InternetMeasurement' }
  else if (ua.includes('https://seolyt.com')) return { bot: 'SEOlytBot' }
  else if (ua.includes('http://linkaffinity.io'))
    return { bot: 'LinkAffinityBot' }
  else if (ua.includes('https://dataforseo.com/dataforseo-bot'))
    return { bot: 'DataForSeoBot' }
  else if (ua.includes('PerplexityBot')) return { bot: 'PerplexityBot' }
  else if (ua.includes('AliyunSecBot')) return { bot: 'AliyunSecBot' }
  else if (ua.includes('YisouSpider')) return { bot: 'YisouSpider' }
  else if (ua.includes('SafeDNSBot')) return { bot: 'SafeDNSBot' }
  else if (ua.includes('HawaiiBot')) return { bot: 'HawaiiBot' }
  else if (ua.includes('Sogou') || ua.includes('sogou web spider'))
    return { bot: 'SogouBot' }
  else if (ua.includes('Scrapy')) return { bot: 'Scrapy' }
  else if (ua.includes('TurnitinBot')) return { bot: 'TurnitinBot' }
  else if (ua.includes('zoombot') || ua.includes('suite.seozoom.it/bot.html'))
    return { bot: 'ZoomBot' }
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
  else if (ua.includes('SonyEricsson')) return { type: 'SonyEricsson' }
  else if (ua.includes('BlackBerry')) return { type: 'BlackBerry' }
  else if (ua.includes('X11; CrOS x86_64')) return { type: 'ChromeOS' }
  else if (ua.includes('Windows')) return { type: 'Windows' }
  else if (ua.includes('Linux')) return { type: 'Linux' }
  else if (ua.includes('FreeBSD')) return { type: 'FreeBSD' }
  else if (ua.includes('NetBSD')) return { type: 'NetBSD' }
  else if (ua.includes('OpenBSD')) return { type: 'OpenBSD' }
  // e.g. "Dart/2.15 (dart:io)"
  else if (/^Dart\/[\d.]+ \(dart:io\)$/.test(ua)) return { bot: 'DartBot' }
  else if (
    // e.g. "Java/21.0.3"
    /^Java\/[\d.]+$/.test(ua) ||
    // e.g. "Apache-HttpClient/4.5.5 (Java/1.8.0_181)"
    /^Apache-HttpClient\/[\d.]+ \(Java\/[\d._]+\)$/.test(ua) ||
    // e.g. "okhttp/4.9.0"
    /^okhttp\/[\d.]+$/.test(ua)
  )
    return { bot: 'JavaBot' }
  // e.g. "Go-http-client/1.1"
  else if (/^Go-http-client\/[\d.]+$/.test(ua)) return { bot: 'GoBot' }
  else if (ua.startsWith('Hackers/')) return { bot: 'HackerNewsBot' }
  else return { type: 'Other' }
}
