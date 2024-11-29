import { loadClientPlugin } from '../../client-plugin.js'
import { allNames } from '@beenotung/tslib/constant/character-name.js'
import { title } from '../../config.js'
import { dataTableAsset, enableDataTable } from '../components/data-table.js'
import { mapArray } from '../components/fragment.js'
import { Locale } from '../components/locale.js'
import { Script } from '../components/script.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { Swiper } from '../components/swiper.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let icons = ['success', 'error', 'warning', 'info', 'question']

let content = (
  <div>
    {Style(/* css */ `
#demo-swiper {
  outline: 1px solid black;
  max-width: 300px;
  height: 150px;
  background-color: #f552;
  --swiper-theme-color: red;
}
#demo-swiper .swiper-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}
#demo-dataTable_wrapper .dt-layout-table {
  justify-content: center;
}
#demo-dataTable .swal2-icon {
  font-size: 0.5rem;
  margin: 1em;
}
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
      <Locale en="Swiper Demo" zh="Swiper 示範" />
    </h2>
    <Swiper
      id="demo-swiper"
      slides={[<p>Slice 1</p>, <p>Slice 2</p>, <p>Slice 3</p>]}
      showPagination
      showArrow
    />
    <h2>
      <Locale en="DataTable Demo" zh="DataTable 示範" />
    </h2>
    <table id="demo-dataTable">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Status</th>
          <th>Icon</th>
        </tr>
      </thead>
      <tbody>
        {mapArray(allNames, (name, index) => {
          let icon = icons[index % icons.length]
          return (
            <tr>
              <td>{index + 1}</td>
              <td>{name}</td>
              <td>{icon}</td>
              <th>
                <div
                  class={`swal2-icon swal2-${icon} swal2-icon-show`}
                  style="display: flex;"
                >
                  <div class="swal2-icon-content">!</div>
                </div>
              </th>
            </tr>
          )
        })}
      </tbody>
    </table>
    {dataTableAsset}
    {enableDataTable('demo-dataTable', {
      pageLength: 2,
      lengthMenu: [1, 2, 3, 5, 10, 25],
    })}
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
    <SourceCode page="demo-plugin.tsx" style="margin-top: 1.5rem" />
  </div>
)

let routes = {
  '/demo-plugin': {
    title: title('Client Plugin Demo'),
    description:
      'Demonstrate using client-side plugins, including swiper and sweet alert',
    menuText: 'Client Plugin',
    node: content,
  },
} satisfies Routes

export default { routes }
