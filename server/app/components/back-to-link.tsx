import { o } from '../jsx/jsx.js'
import { Locale } from './locale.js'
import { Link } from './router.js'

export function BackToLink(attrs: { title: string; href: string }) {
  return (
    <p>
      <Locale en="Back to" zh_hk="返回" zh_cn="返回" /> {attrs.title}
    </p>
  )
}

export function GoToLink(attrs: { title: string; href: string }) {
  return (
    <p>
      <Locale en="Go to" zh_hk="前往" zh_cn="前往" /> {attrs.title}
    </p>
  )
}
