import { Context, getContextUrl } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { LocaleVariants, isPreferZh } from './locale.js'
import { Page } from './page.js'
import SourceCode from './source-code.js'

function StatusPage(
  attrs: {
    status: number
    id: string
    title: LocaleVariants<string>
    page?: string
    backText?: string
    backHref?: string
  },
  context: Context,
): Node {
  if (context.type === 'express' && !context.res.headersSent) {
    context.res.status(attrs.status)
  }
  let zh = isPreferZh(context)
  let title = zh ? attrs.title.zh : attrs.title.en
  let label = zh ? '網址' : 'Url'
  return (
    <Page
      id={attrs.id}
      title={title}
      backHref={attrs.backHref || '/'}
      backText={attrs.backText}
    >
      <p>
        {label}: <code>{getContextUrl(context)}</code>
      </p>
      {attrs.page ? <SourceCode page={attrs.page} /> : null}
    </Page>
  )
}

export default StatusPage
