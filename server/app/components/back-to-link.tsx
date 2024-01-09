import { o } from '../jsx/jsx.js'
import { Link } from './router.js'

export function BackToLink(attrs: { title: string; href: string }) {
  return (
    <p>
      Back to <Link href={attrs.href}>{attrs.title}</Link>
    </p>
  )
}
