import { proxy } from '../../../db/proxy.js'
import {
  getOtherUserAgents,
  getUAStatsProgress,
} from '../../../db/user-agent.js'
import { Locale, Title } from '../components/locale.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

function agentTable(title: string, rows: [name: string, count: number][]) {
  if (rows.length === 0) return
  rows.sort((a, b) => b[1] - a[1])
  return (
    <table>
      <thead>
        <tr>
          <th>{title}</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {[
          rows.map(([name, count]) => (
            <tr>
              <td>{name}</td>
              <td>{count}</td>
            </tr>
          )),
        ]}
      </tbody>
    </table>
  )
}

function Tables() {
  return (
    <>
      <p>{getUAStatsProgress()}</p>
      {agentTable(
        'User Agent',
        proxy.ua_type.map(row => [row.name, row.count]),
      )}
      {agentTable(
        'Bot Agent',
        proxy.ua_bot.map(row => [row.name, row.count]),
      )}
      {agentTable(
        'Other Agent',
        getOtherUserAgents().map(row => [row.user_agent, row.count]),
      )}
    </>
  )
}

let UserAgents = (
  <div id="user-agents">
    <h1>User Agents of Visitors</h1>
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
  max-width: calc(90vw - 8rem);
  word-break: break-word;
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

let routes = {
  '/user-agents': {
    menuText: <Locale en="Visitor Stats" zh_hk="訪客統計" zh_cn="访客统计" />,
    title: (
      <Title
        t={
          <Locale
            en="User Agents of Visitors"
            zh_hk="訪客的用戶代理"
            zh_cn="访客的用戶代理"
          />
        }
      />
    ),
    description: (
      <Locale
        en="User agents of this site's visitors"
        zh_hk="此網站訪客的用戶代理資訊"
        zh_cn="此网站访客的用户代理资讯"
      />
    ),
    node: UserAgents,
  },
} satisfies Routes

export default { routes }
