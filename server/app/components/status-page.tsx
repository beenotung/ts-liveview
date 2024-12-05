import { Context, getContextUrl } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Locale } from './locale.js'
import { Page } from './page.js'
import SourceCode from './source-code.js'

function StatusPage(
  attrs: {
    status: number
    id: string
    title: string
    description?: string
    page?: string
    backText?: string
    backHref?: string
  },
  context: Context,
): Node {
  if (context.type === 'express' && !context.res.headersSent) {
    context.res.status(attrs.status)
  }
  return (
    <Page
      id={attrs.id}
      title={attrs.title}
      backHref={attrs.backHref || '/'}
      backText={attrs.backText}
    >
      <p>
        <Locale en="Url" zh_hk="網址" zh_cn="网址" />:{' '}
        <code>{getContextUrl(context)}</code>
      </p>
      {attrs.description ? <p>{attrs.description}</p> : null}
      {attrs.page ? <SourceCode page={attrs.page} /> : null}
    </Page>
  )
}

export default StatusPage
