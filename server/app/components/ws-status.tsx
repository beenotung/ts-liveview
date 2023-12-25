import { o } from '../jsx/jsx.js'
import Style from './style.js'

let hide = Style(/* css */ `
#ws_status {
  display: none;
}
`)

let safeArea = <div style="height: 3rem"></div>

export const wsStatus = { hide, safeArea }
