import { loadClientPlugin } from '../../client-plugin.js'
import { title } from '../../config.js'
import { Locale } from '../components/locale.js'
import { Script } from '../components/script.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let icons = ['success', 'error', 'warning', 'info', 'question']

let content = (
  <div>
    {Style(/* css */ `
.demo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
`)}
    <h1>
      <Locale en="Client-Side Plugin Demo" zh="客戶端插件示範" />
    </h1>
    <p>
      <Locale
        en="This page demo loading client-side plugins that is bundled with npm packages and run them in the browser."
        zh="此頁面演示加載與 npm 包捆綁在一起的客戶端插件並在瀏覽器中運行它們。"
      />
    </p>
    <h2>
      <Locale en="Sweet Alert Demo" zh="Sweet Alert 示範" />
    </h2>
    {loadClientPlugin({ entryFile: 'dist/client/sweetalert.js' }).node}
    <h3>
      <Locale en="Toast" zh="提示 (Toast)" />
    </h3>
    <div class="demo-buttons">
      <button onclick="showToast('sample text message')">default</button>
      {[
        icons.map(icon => (
          <button onclick={`showToast('sample ${icon} message', '${icon}')`}>
            {icon}
          </button>
        )),
      ]}
    </div>
    <h3>
      <Locale en="Alert" zh="通知彈出視窗 (Alert)" />
    </h3>
    <div class="demo-buttons">
      <button onclick="showAlert('sample text message')">default</button>
      {[
        icons.map(icon => (
          <button onclick={`showAlert('sample ${icon} message', '${icon}')`}>
            {icon}
          </button>
        )),
      ]}
    </div>
    <h3>
      <Locale en="Confirm" zh="確認彈出視窗 (Confirm)" />
    </h3>
    <div class="demo-buttons">
      <button onclick="demoConfirm()">default</button>
      {[
        icons.map(icon => (
          <button onclick={`demoConfirm('${icon}')`}>{icon}</button>
        )),
      ]}
    </div>
    {Script(/* javascript */ `
async function demoConfirm(icon) {
  let isConfirmed = await showConfirm({
    title: 'Confirm to submit?',
    text: 'Your content will be reviewed before publishing.', // optional
    icon, // optional
  })
  if (isConfirmed) {
    showToast('Confirmed', 'success')
  } else {
    showToast('Cancelled', 'info')
  }
}
`)}
    <SourceCode page="demo-toast.tsx" style="margin-top: 1.5rem" />
  </div>
)

let routes = {
  '/toast': {
    title: title('Sweet Alert Toast Demo'),
    description: 'Demonstrate using sweet alert client-side plugin',
    menuText: 'Client Plugin',
    node: content,
  },
} satisfies Routes

export default { routes }
