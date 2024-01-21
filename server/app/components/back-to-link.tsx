import { o } from '../jsx/jsx.js'
import { Link } from './router.js'

export function BackToLink(attrs: { title: string; href: string }) {
  return (
    <Link href={attrs.href} tagName="ion-button" is-back>
      Back to {attrs.title}
    </Link>
  )
}
