import { loadClientPlugin } from '../../client-plugin.js'
import { title } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let content = (
  <div>
    <h1>Client-Side Plugin Demo</h1>
    <p>
      This page demo client-side plugins that bundle npm packages and run them
      in the browser.
    </p>
    <h2>Sweet Alert Toasts</h2>
    {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
      <button onclick="showToast('sample text message')">default</button>
      {[
        ['success', 'error', 'warning', 'info', 'question'].map(icon => (
          <button onclick={`showToast('sample ${icon} message', '${icon}')`}>
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
