import { o } from '../jsx/jsx.js'
import Style from './style.js'

let hide = Style(/* css */ `
#ws_status {
  display: none;
}
`)

let safeArea = <div class="ws_status--safe-area"></div>

export const wsStatus = { hide, safeArea }
