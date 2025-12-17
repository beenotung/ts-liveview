import { confettiPlugin, sweetAlertPlugin } from '../../client-plugins.js'
import { allNames } from '@beenotung/tslib/constant/character-name.js'
import { DataTable } from '../components/data-table.js'
import { mapArray } from '../components/fragment.js'
import { Locale, Title } from '../components/locale.js'
import { Script } from '../components/script.js'
import SourceCode from '../components/source-code.js'
import Style from '../components/style.js'
import { Swiper } from '../components/swiper.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { Chart, ChartScript } from '../components/chart.js'

let icons = ['success', 'error', 'warning', 'info', 'question']

// init demo chart data
let demo_chart_label: string[] = []
let demo_chart_data: number[] = []
Math.PI.toString()
  .replace('.', '')
  .split('')
  .forEach((char, index) => {
    demo_chart_label.push(String(index + 1))
    demo_chart_data.push(parseInt(char))
  })

let content = (
  <div id="demo-plugin">
    {Style(/* css */ `
h2 {
  margin: 0.5em 0;
}
#demo-plugin hr {
  margin: 1em 0.25em;
  border-color: #5555;
}
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
#demo-chart-container {
  max-width: 320px;
  margin: auto;
}
`)}
    <h1>
      <Locale
        en="Client-Side Plugin Demo"
        zh_hk="客戶端插件示範"
        zh_cn="客户端插件示范"
      />
    </h1>
    <p>
      <Locale
        en="This page demo loading client-side plugins that is bundled with npm packages and run them in the browser."
        zh_hk="此頁面演示加載與 npm 包捆綁在一起的客戶端插件並在瀏覽器中運行它們。"
        zh_cn="此页面演示加载与 npm 包捆绑在一起的客户端插件并在浏览器中运行它们。"
      />
    </p>

    <hr />

    <h2>
      <Locale
        en="Canvas Confetti Demo"
        zh_hk="彩紙示範 (canvas-confetti)"
        zh_cn="彩纸示范 (canvas-confetti)"
      />
    </h2>
    <div className="demo-buttons">
      <button onclick="fireConfetti()">
        <Locale en="Fire Confetti" zh_hk="放彩紙" zh_cn="放彩纸" />
      </button>
      <button onclick="fireStar()">
        <Locale en="Fire Star" zh_hk="放星星" zh_cn="放星星" />
      </button>
      <button onclick="fireEmoji()">
        <Locale en="Fire Emoji" zh_hk="放表情符號" zh_cn="放表情符号" />
      </button>
    </div>
    {confettiPlugin.node}
    {Script(/* javascript */ `
// play the effect once automatically when enter the page
fireConfetti()
`)}

    <hr />

    <h2>
      <Locale
        en="Swiper/Slider Demo"
        zh_hk="Swiper/Slider 示範"
        zh_cn="Swiper/Slider 示范"
      />
    </h2>
    <Swiper
      id="demo-swiper"
      slides={[<p>Slice 1</p>, <p>Slice 2</p>, <p>Slice 3</p>]}
      showPagination
      showArrow
    />

    <hr />

    <h2>
      <Locale
        en="Chart.js Demo"
        zh_hk="圖表示範 (chart.js)"
        zh_cn="图表示范 (chart.js)"
      />
    </h2>
    {ChartScript}
    <div id="demo-chart-container">
      <Chart
        canvas_id="demo-chart"
        data_labels={demo_chart_label}
        datasets={[{ label: 'PI Digits', data: demo_chart_data }]}
        borderWidth={1}
        min={0}
        max={9}
      />
    </div>

    <hr />

    <h2>
      <Locale
        en="SweetAlert2 Demo"
        zh_hk="通知彈出視窗示範 (SweetAlert2)"
        zh_cn="通知弹出窗口示範 (SweetAlert2)"
      />
    </h2>
    {sweetAlertPlugin.node}
    <h3>
      <Locale en="Toast" zh_hk="提示 (Toast)" zh_cn="提示 (Toast)" />
    </h3>
    <div class="demo-buttons">
      <button onclick="showToast('sample text message')">default</button>
      {mapArray(icons, icon => (
        <button onclick={`showToast('sample ${icon} message', '${icon}')`}>
          {icon}
        </button>
      ))}
    </div>
    <h3>
      <Locale
        en="Alert"
        zh_hk="通知彈出視窗 (Alert)"
        zh_cn="通知弹出窗口 (Alert)"
      />
    </h3>
    <div class="demo-buttons">
      <button onclick="showAlert('sample text message')">default</button>
      {mapArray(icons, icon => (
        <button onclick={`showAlert('sample ${icon} message', '${icon}')`}>
          {icon}
        </button>
      ))}
    </div>
    <h3>
      <Locale
        en="Confirm"
        zh_hk="確認彈出視窗 (Confirm)"
        zh_cn="确认弹出窗口 (Confirm)"
      />
    </h3>
    <div class="demo-buttons">
      <button onclick="demoConfirm()">default</button>
      {mapArray(icons, icon => (
        <button onclick={`demoConfirm('${icon}')`}>{icon}</button>
      ))}
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

    <hr />

    <h2>
      <Locale
        en="DataTables.net Demo"
        zh_hk="表格示範 (DataTables.net)"
        zh_cn="表格示范 (DataTables.net)"
      />
    </h2>
    <DataTable
      id="demo-dataTable"
      headers={{
        id: <Locale en="ID" zh_hk="ID" zh_cn="ID" />,
        name: <Locale en="Username" zh_hk="用戶名" zh_cn="用户名" />,
        status: <Locale en="Status" zh_hk="狀態" zh_cn="状态" />,
        icon: <Locale en="Icon" zh_hk="圖示" zh_cn="图示" />,
      }}
      rows={allNames.map((name, index) => {
        let icon = icons[index % icons.length]
        return {
          id: index + 1,
          name,
          status: icon,
          icon: (
            <div
              class={`swal2-icon swal2-${icon} swal2-icon-show`}
              style="display: flex;"
            >
              <div class="swal2-icon-content">!</div>
            </div>
          ),
        }
      })}
    />

    <hr />

    <SourceCode page="demo-plugin.tsx" style="margin-top: 1.5rem" />
  </div>
)

let routes = {
  '/demo-plugin': {
    menuText: (
      <Locale en="Client Plugin" zh_hk="客戶端插件" zh_cn="客户端插件" />
    ),
    title: (
      <Title
        t={
          <Locale
            en="Client Plugin Demo"
            zh_hk="客戶端插件示範"
            zh_cn="客户端插件示范"
          />
        }
      />
    ),
    description: (
      <Locale
        en="Demonstrate using client-side plugins, including Swiper, DataTables and SweetAlert2"
        zh_hk="演示使用客戶端插件，包括 Swiper、DataTable 和 SweetAlert2"
        zh_cn="演示使用客户端插件，包括 Swiper、DataTable 和 SweetAlert2"
      />
    ),
    node: content,
  },
} satisfies Routes

export default { routes }
