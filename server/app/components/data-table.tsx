import { o } from '../jsx/jsx.js'
import { mapArray } from './fragment.js'
import { Script } from './script.js'
import { Config } from 'datatables.net-dt'

export let dataTableAsset = (
  <>
    <link
      rel="stylesheet"
      href="/npm/datatables.net-dt/css/dataTables.dataTables.min.css"
    />
    <script src="/npm/jquery/dist/jquery.slim.min.js"></script>
    <script src="/npm/datatables.net/js/dataTables.min.js"></script>
  </>
)

export function enableDataTable(id: string, config: Config = {}) {
  return Script(/* javascript */ `
(function initDateTable() {
	if (typeof DataTable !== 'function') {
		// still loading
		setTimeout(initDateTable, 50)
		return
	}
	let id = ${JSON.stringify(id)};
	let table = document.getElementById(id);
  let dataTable = new DataTable(table, ${JSON.stringify(config)});
})()
`)
}

export function DataTable<T>(attrs: {
  'id': string
  'headers': {
    col: keyof T
    label: Node
  }[]
  'rows': T[]
  'skip-assets'?: boolean
}) {
  let skipAssets = attrs['skip-assets']
  return (
    <>
      <table id={attrs.id}>
        <thead>
          <tr>
            {mapArray(attrs.headers, header => (
              <th>{header.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mapArray(attrs.rows, row => (
            <tr>
              {mapArray(attrs.headers, header => (
                <td>{row[header.col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {skipAssets ? null : dataTableAsset}
      {enableDataTable(attrs.id, {
        pageLength: 3,
        lengthMenu: [1, 2, 3, 5, 10, 25],
      })}
    </>
  )
}
