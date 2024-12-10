import { o } from '../jsx/jsx.js'
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
