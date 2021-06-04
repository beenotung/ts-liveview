import { VElement, VNode } from '../../../client/dom'
import JSX from '../../../client/jsx'

type Props = {
  path: string
  component: () => VNode
}
function Route(props: Props) {}
export default Route
