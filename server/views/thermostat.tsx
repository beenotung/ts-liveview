import JSX from '../../client/jsx.js'

let initView = (
  <div>
    <span id="count">0</span>
    <a onclick="emit(['inc'])">+</a>
    <a onclick="emit(['dec'])">-</a>
  </div>
)

export let thermostatView = {
  initView,
}
