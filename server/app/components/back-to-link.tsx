import { o } from '../jsx/jsx.js'
import { Content } from './page.js'
import { Link } from './router.js'

export function BackToLink(attrs: { title: string; href: string }) {
  return (
    <Content
      web={
        <p>
          Back to <Link href={attrs.href}>{attrs.title}</Link>
        </p>
      }
      ionic={
        <Link href={attrs.href} tagName="ion-button" is-back>
          Back to {attrs.title}
        </Link>
      }
    ></Content>
  )
}
