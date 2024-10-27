import { o } from '../jsx/jsx.js'
import { Script } from './script.js'

export let dataTableAsset = (
  <>
    <link
      rel="stylesheet"
      href="https://cdn.datatables.net/2.0.8/css/dataTables.dataTables.min.css"
    />
    <script src="https://code.jquery.com/jquery-3.7.1.slim.min.js"></script>
    <script src="https://cdn.datatables.net/2.0.8/js/dataTables.min.js"></script>
  </>
)

export function enableDataTable(id: string) {
  return Script(/* javascript */ `
(function(){
	let id = ${JSON.stringify(id)};
	let table = document.getElementById(id);
  let dataTable = new DataTable(table);
})()
`)
}
