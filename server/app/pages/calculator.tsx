import { Style } from '../components/style.js'
import { o } from '../jsx/jsx.js'
import SourceCode from '../components/source-code.js'
import { Locale, Title } from '../components/locale.js'
import { Routes } from '../routes.js'

let update = `c.textContent = a.valueAsNumber + b.valueAsNumber`

function Calculator() {
  return (
    <div id="calculator">
      {Style(/* css */ `
.answer {
  color: green
}
`)}
      <h1>Calculator Demo</h1>
      <p>This page demo completely local stateful component.</p>
      <p>
        The realtime-update does not relay on the server once this page is
        loaded.
      </p>
      <input type="number" id="a" value="1" oninput={update} />
      {' + '}
      <input type="number" id="b" value="1" oninput={update} />
      {' = '}
      <span class="answer" id="c">
        2
      </span>
      <SourceCode page="calculator.tsx" />
    </div>
  )
}

let t = <Locale en="Calculator" zh_hk="計算機" zh_cn="计算器" />

let routes = {
  '/calculator': {
    menuText: t,
    title: <Title t={t} />,
    description: (
      <Locale
        en="A simple stateful component demo"
        zh_hk="一個簡單的有狀態元件範例"
        zh_cn="一个简单有状态组件的示例"
      />
    ),
    node: <Calculator />,
  },
} satisfies Routes

export default { routes }
