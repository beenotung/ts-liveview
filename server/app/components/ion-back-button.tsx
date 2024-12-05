import { o } from '../jsx/jsx.js'
import { ThemeColor } from './page.js'
import { Link } from './router.js'

export function IonBackButton(attrs: {
  href: string
  color?: ThemeColor
  class?: string
  backText?: string // default: 'Back'
  buttonsSlot?: string | false // default: 'start'
}) {
  let { href, class: className, backText, buttonsSlot, ...extraAttrs } = attrs
  className = className ? className + ' ' : ''
  backText ??= href === '/' ? 'Home' : 'Back'
  buttonsSlot ??= 'start'
  let button = (
    <Link href={href} is-back>
      <ion-button class={className + 'md-only'} {...extraAttrs}>
        <ion-icon name="arrow-back-outline" slot="icon-only"></ion-icon>
      </ion-button>
      <ion-button class={className + 'ios-only'} {...extraAttrs}>
        <ion-icon name="chevron-back-outline"></ion-icon>
        <span>{backText}</span>
      </ion-button>
    </Link>
  )
  if (buttonsSlot) {
    return <ion-buttons slot={buttonsSlot}>{button}</ion-buttons>
  } else {
    return button
  }
}
