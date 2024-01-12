import { loadClientPlugin } from '../../client-plugin.js'
import { title } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let icons = ['success', 'error', 'warning', 'info', 'question']

let content = (
  <div>
    <h1>Client-Side Plugin Demo</h1>
    <p>
      This page demo client-side plugins that bundle npm packages and run them
      in the browser.
    </p>
    <h2>Sweet Alert Demo</h2>
    {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}
    <h3>Toast</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
      <button onclick="showToast('sample text message')">default</button>
      {[
        icons.map(icon => (
          <button onclick={`showToast('sample ${icon} message', '${icon}')`}>
            {icon}
          </button>
        )),
      ]}
    </div>
    <h3>Alert</h3>
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
      <button onclick="showAlert('sample text message')">default</button>
      {[
        icons.map(icon => (
          <button onclick={`showAlert('sample ${icon} message', '${icon}')`}>
            {icon}
          </button>
        )),
      ]}
    </div>
  </div>
)

let routes: Routes = {
  '/toast': {
    title: title('Sweet Alert Toast Demo'),
    description: 'Demonstrate using sweet alert client-side plugin',
    menuText: 'Client Plugin',
    node: content,
  },
}

export default { routes }
