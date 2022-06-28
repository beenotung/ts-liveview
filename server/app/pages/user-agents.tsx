import { getUserAgents } from '../../../db/store.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'

function classifyUserAgents(
  rows: Array<{ user_agent: string; count: number }>,
) {
  let Android = 0
  let iPhone = 0
  let iPad = 0
  let MacOS = 0
  let Windows = 0
  let Linux = 0
  let Kindle = 0
  let curl = 0
  let Wget = 0
  let Links = 0
  let Lynx = 0
  let BingBot = 0
  let GoogleBot = 0
  let DuckDuckGoBot = 0
  let TwitterBot = 0
  let TelegramBot = 0
  let WhatsAppBot = 0
  let YandexBot = 0
  let MixrankBot = 0
  let PetalBot = 0
  let QwantBot = 0
  let BLEXBot = 0
  let AhrefsBot = 0
  let DotBot = 0
  let CiscoAnyConnect = 0
  let Other = 0
  let PythonRequests = 0
  let CensysInspect = 0
  let PaloBot = 0
  let Nmap = 0
  let others = new Map<string, number>()

  rows.forEach(row => {
    let ua: string = row.user_agent
    let count: number = row.count
    if (ua.startsWith('TelegramBot')) TelegramBot += count
    else if (ua.startsWith('WhatsApp')) WhatsAppBot += count
    else if (ua.startsWith('AnyConnect')) CiscoAnyConnect += count
    else if (ua.startsWith('python-requests')) PythonRequests += count
    else if (ua.includes('www.bing.com/bingbot')) BingBot += count
    else if (ua.includes('paloaltonetworks.com')) PaloBot += count
    else if (ua.includes('https://nmap.org/book/nse.html')) Nmap += count
    else if (ua.includes('https://webmaster.petalsearch.com/site/petalbot'))
      PetalBot += count
    else if (ua.includes('https://www.qwant.com/')) QwantBot += count
    else if (ua.includes('http://webmeup-crawler.com/')) BLEXBot += count
    else if (ua.includes('https://opensiteexplorer.org/dotbot')) DotBot += count
    else if (ua.includes('http://ahrefs.com/robot/')) AhrefsBot += count
    else if (ua.includes('http://www.google.com/bot.html')) GoogleBot += count
    else if (ua.includes('Googlebot-Image')) GoogleBot += count
    else if (ua.includes('http://duckduckgo.com')) DuckDuckGoBot += count
    else if (ua.includes('http://yandex.com/bots')) YandexBot += count
    else if (ua.includes('https://about.censys.io')) CensysInspect += count
    else if (ua.includes('crawler@mixrank.com')) MixrankBot += count
    else if (ua.includes('iPhone')) iPhone += count
    else if (ua.includes('iPad')) iPad += count
    else if (ua.includes('Macintosh')) MacOS += count
    else if (ua.includes('KFAPWI')) Kindle += count
    else if (ua.includes('curl')) curl += count
    else if (ua.includes('Wget')) Wget += count
    else if (ua.includes('Lynx')) Lynx += count
    else if (ua.includes('Links')) Links += count
    else if (ua.includes('Android') || ua.includes('Nokia')) Android += count
    else if (ua.includes('Windows')) Windows += count
    else if (ua.includes('Linux')) Linux += count
    else {
      Other += count
      others.set(ua, (others.get(ua) || 0) + 1)
    }
  })

  return {
    platforms: {
      Android,
      iPhone,
      iPad,
      MacOS,
      Windows,
      Linux,
      Kindle,
      curl,
      Wget,
      Links,
      Lynx,
      Other,
    },
    bots: {
      BingBot,
      GoogleBot,
      DuckDuckGoBot,
      TwitterBot,
      TelegramBot,
      WhatsAppBot,
      QwantBot,
      BLEXBot,
      PetalBot,
      YandexBot,
      CiscoAnyConnect,
      AhrefsBot,
      DotBot,
      PythonRequests,
      CensysInspect,
      MixrankBot,
      PaloBot,
      Nmap,
    },
    others,
  }
}

function mapRows(counts: Record<string, number> | Map<string, number>) {
  return (
    counts instanceof Map
      ? Array.from(counts.entries())
      : Object.entries(counts)
  )
    .filter(entry => entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([ua, count]) => (
      <tr>
        <td>{ua}</td>
        <td>{count}</td>
      </tr>
    ))
}

function Tables() {
  let rows = getUserAgents()
  let { others, bots, platforms } = classifyUserAgents(rows)

  let Bots = Object.values(bots).reduce((acc, c) => acc + c)
  Object.assign(platforms, { Bots })

  let platformTable = (
    <table>
      <thead>
        <tr>
          <th>User Agent</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>{[mapRows(platforms)]}</tbody>
    </table>
  )

  let botTable = (
    <table>
      <thead>
        <tr>
          <th>Bot Agent</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>{[mapRows(bots)]}</tbody>
    </table>
  )

  if (others.size === 0) {
    return (
      <>
        {platformTable}
        {botTable}
      </>
    )
  }
  let otherTable = (
    <table>
      <thead>
        <th>Other User Agents</th>
        <th>Count</th>
      </thead>
      <tbody>{[mapRows(others)]}</tbody>
    </table>
  )
  return (
    <>
      {platformTable}
      {botTable}
      {otherTable}
    </>
  )
}

let UserAgents = (
  <div id="user-agents">
    <h2>User Agents of Visitors</h2>
    {Style(/* css */ `
#user-agents table {
  border-collapse: collapse;
  margin: 1rem;
  display: inline;
}
#user-agents th,
#user-agents td {
  border: 1px solid var(--text-color, black);
  padding: 0.25rem 0.5rem;
}
`)}
    <p>This page demonstrates showing query result from database.</p>
    <p>
      Below list of user agents are collected from the visitor's HTTP header.
    </p>
    <Tables />
    <SourceCode page="user-agents.tsx" />
  </div>
)

export default UserAgents
