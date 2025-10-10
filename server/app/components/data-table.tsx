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
  'headers': Partial<Record<keyof T, Node>>
  'rows': T[]
  'skip-assets'?: boolean
  /** default 3 */
  'page-length'?: number
  /** default [1, 2, 3, 5, 10, 25] */
  'length-menu'?: number[]
}) {
  let skipAssets = attrs['skip-assets']
  let pageLength = attrs['page-length'] ?? 3
  let lengthMenu = attrs['length-menu'] ?? [1, 2, 3, 5, 10, 25]
  let fields = Object.keys(attrs.headers) as (keyof T)[]
  return (
    <>
      <table id={attrs.id}>
        <thead>
          <tr>
            {mapArray(Object.values(attrs.headers), label => (
              <th>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mapArray(attrs.rows, row => (
            <tr>
              {mapArray(fields, field => (
                <td>{row[field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {skipAssets ? null : dataTableAsset}
      {enableDataTable(attrs.id, {
        pageLength,
        lengthMenu,
      })}
    </>
  )
}
