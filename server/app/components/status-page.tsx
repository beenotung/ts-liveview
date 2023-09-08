import { Context, getContextUrl } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { LocaleVariants, isPreferZh } from './locale.js'
import SourceCode from './source-code.js'

function StatusPage(
  attrs: {
    id: string
    title: LocaleVariants
    page?: string
  },
  context: Context,
): Node {
  let zh = isPreferZh(context)
  return (
    <div id={attrs.id}>
      <h1>{zh ? attrs.title.zh : attrs.title.en}</h1>
      <p>
        {zh ? '網址: ' : 'Url: '}
        <code>{getContextUrl(context)}</code>
      </p>
      {attrs.page ? <SourceCode page={attrs.page} /> : null}
    </div>
  )
}

export default StatusPage
