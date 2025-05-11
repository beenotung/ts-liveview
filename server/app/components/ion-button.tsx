import { o } from '../jsx/jsx.js'
import { NodeList } from '../jsx/types.js'
import { ThemeColor } from './page.js'
import { Link } from './router.js'

export function IonButton(
  attrs: {
    url: string
    class?: string
    style?: string
    children?: NodeList
    disabled?: boolean
    color?: ThemeColor
    expand?: 'block' | 'full'
    shape?: 'round'
    fill?: 'clear' | 'outline' | 'solid'
    size?: 'small' | 'default' | 'large'
    slot?: 'start' | 'end'
    hidden?: boolean | undefined
    rel?: 'nofollow'
  } & object,
) {
  let { url, children, disabled, ...rest } = attrs
  return (
    <Link
      tagName="ion-button"
      href={url}
      disabled={disabled ? '' : undefined}
      {...rest}
    >
      {[children]}
    </Link>
  )
}
