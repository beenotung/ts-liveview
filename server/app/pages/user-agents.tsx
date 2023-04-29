import { proxy } from '../../../db/proxy.js'
import {
  getOtherUserAgents,
  getUAStatsProgress,
} from '../../../db/user-agent.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'

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

export default UserAgents
