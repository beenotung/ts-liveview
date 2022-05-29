import { getUserAgents } from '../../../db/store.js'
import Style from '../components/style.js'
import JSX from '../jsx/jsx.js'

function Rows() {
  let { otherSet, ...agents } = getUserAgents()
  let rows = Object.entries(agents)
    .filter(entry => entry[1] > 0)
    .sort((a, b) => b[1] - a[1])
    .map(entry => (
      <tr>
        <td>{entry[0]}</td>
        <td>{entry[1]}</td>
      </tr>
    ))
  if (otherSet.size > 0) {
    rows.push(
      <tr>
        <th colspan="2">Other Agents</th>
      </tr>,
    )
    otherSet.forEach(name =>
      rows.push(
        <tr>
          <td colspan="2">{name}</td>
        </tr>,
      ),
    )
  }
  return [rows]
}

let UserAgents = (
  <div id="user-agents">
    <h2>User Agents of Visitors</h2>
    {Style(/* css */ `
#user-agents table {
  border-collapse: collapse;
}
#user-agents th,
#user-agents td {
  border: 1px solid black;
  padding: 0.25rem 0.5rem;
}
`)}
    <p>This page demonstrates showing query result from database.</p>
    <p>
      Below list of user agents are collected from the visitor's HTTP header.
    </p>
    <table>
      <thead>
        <tr>
          <th>User Agent</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        <Rows />
      </tbody>
    </table>
  </div>
)

export default UserAgents
