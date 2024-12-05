import { o } from '../jsx/jsx.js'
import type { Node } from '../jsx/types'
import StatusPage from '../components/status-page.js'
import { Locale } from '../components/locale.js'

let NotImplemented: Node = (
  <StatusPage
    id="not-implemented"
    status={501}
    title={
      <Locale
        en="Function Not Yet Implemented"
        zh_hk="功能尚未實現"
        zh_cn="功能尚未实现"
      />
    }
    page="not-implemented.tsx"
  />
)

export default NotImplemented
