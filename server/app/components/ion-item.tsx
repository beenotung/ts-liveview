import { o } from '../jsx/jsx.js'
import { NodeList } from '../jsx/types.js'
import { ThemeColor } from './page.js'
import { Link } from './router.js'

export function IonItem(
  attrs: {
    url?: string
    class?: string
    style?: string
    children?: NodeList
    disabled?: boolean
    color?: ThemeColor
    lines?: 'full' | 'inset' | 'none'
    detail?: boolean
    button?: boolean
    hidden?: boolean | undefined
  } & object,
) {
  let { url, children, disabled, ...rest } = attrs
  return url ? (
    <Link
      tagName="ion-item"
      href={url}
      disabled={disabled ? '' : undefined}
      {...rest}
    >
      {[children]}
    </Link>
  ) : (
    <ion-item disabled={disabled ? '' : undefined} {...rest}>
      {[children]}
    </ion-item>
  )
}
