import { o } from '../jsx/jsx.js'
import { Content } from './page.js'
import { Locale } from './locale.js'
import { Link } from './router.js'

export function BackToLink(attrs: { title: string; href: string }) {
  return (
    <Content
      web={
        <p>
          <Locale en="Back to" zh_hk="返回" zh_cn="返回" /> {attrs.title}
        </p>
      }
      ionic={
        <Link href={attrs.href} tagName="ion-button" is-back>
          <Locale en="Back to" zh_hk="返回" zh_cn="返回" /> {attrs.title}
        </Link>
      }
    ></Content>
  )
}

export function GoToLink(attrs: { title: string; href: string }) {
  return (
    <Content
      web={
        <p>
          <Locale en="Go to" zh_hk="前往" zh_cn="前往" /> {attrs.title}
        </p>
      }
      ionic={
        <Link href={attrs.href} tagName="ion-button">
          <Locale en="Go to" zh_hk="前往" zh_cn="前往" /> {attrs.title}
        </Link>
      }
    ></Content>
  )
}
