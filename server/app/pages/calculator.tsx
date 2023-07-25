import { Style } from '../components/style.js'
import { o } from '../jsx/jsx.js'
import SourceCode from '../components/source-code.js'

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
export default Calculator
