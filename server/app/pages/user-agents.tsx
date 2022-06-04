import { getUserAgents } from '../../../db/store.js'
import Style from '../components/style.js'
import JSX from '../jsx/jsx.js'
import type { Node } from '../jsx/types.js'

function Tables() {
  let { otherSet, ...agents } = getUserAgents()
  let mainTable = (
    <table>
      <thead>
        <tr>
          <th>User Agent</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {[
          Object.entries(agents)
            .filter(entry => entry[1] > 0)
            .sort((a, b) => b[1] - a[1])
            .map(entry => (
              <tr>
                <td>{entry[0]}</td>
                <td>{entry[1]}</td>
              </tr>
            )),
        ]}
      </tbody>
    </table>
  )
  if (otherSet.size === 0) {
    return mainTable
  }
  let rows: Node[] = []
  otherSet.forEach(name =>
    rows.push(
      <tr>
        <td>{name}</td>
      </tr>,
    ),
  )
  let otherTable = (
    <table>
      <thead>
        <th>Other User Agents</th>
      </thead>
      <tbody>{[rows]}</tbody>
    </table>
  )
  return (
    <>
      {mainTable}
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
  border: 1px solid black;
  padding: 0.25rem 0.5rem;
}
`)}
    <p>This page demonstrates showing query result from database.</p>
    <p>
      Below list of user agents are collected from the visitor's HTTP header.
    </p>
    <Tables />
  </div>
)

export default UserAgents
