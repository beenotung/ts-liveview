import { o } from '../jsx/jsx.js'
import type { Node } from '../jsx/types'
import StatusPage from '../components/status-page.js'

let NotImplemented: Node = (
  <StatusPage
    id="not-implemented"
    title={{
      en: '501 Function Not Yet Implemented',
      zh: '501 功能尚未實現',
    }}
    page="not-implemented.tsx"
  />
)

export default NotImplemented
