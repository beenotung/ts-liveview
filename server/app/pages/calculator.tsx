import { Style } from '../components/style.js'
import JSX from '../jsx/jsx.js'

let update = `c.textContent = a.valueAsNumber + b.valueAsNumber`

function Calculator() {
  return (
    <div id="calculator">
      {Style(/* css */ `
.answer {
  color: green
}
`)}
      <h2>Calculator Demo</h2>
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
    </div>
  )
}
export default Calculator
