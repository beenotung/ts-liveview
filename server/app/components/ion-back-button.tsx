import { o } from '../jsx/jsx.js'
import { Locale } from './locale.js'
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
  backText ??=
    href === '/' ? (
      <Locale en="Home" zh_hk="首頁" zh_cn="首页" />
    ) : (
      <Locale en="Back" zh_hk="返回" zh_cn="返回" />
    )
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
