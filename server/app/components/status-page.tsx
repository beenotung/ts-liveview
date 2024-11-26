import { config, LayoutType } from '../../config.js'
import { Context, getContextUrl } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { IonBackButton } from './ion-back-button.js'
import { LocaleVariants, isPreferZh } from './locale.js'
import SourceCode from './source-code.js'

function StatusPage(
  attrs: {
    status: number
    id: string
    title: LocaleVariants
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
  if (config.layout_type === LayoutType.ionic) {
    return (
      <>
        <ion-header>
          <ion-toolbar>
            <IonBackButton
              href={attrs.backHref || '/'}
              backText={attrs.backText}
            />
            <ion-title role="heading" aria-level="1">
              {title}
            </ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content id={attrs.id} class="ion-padding">
          <p>
            {label}: <code>{getContextUrl(context)}</code>
          </p>
        </ion-content>
      </>
    )
  }
  return (
    <div id={attrs.id}>
      <h1>{title}</h1>
      <p>
        {label}: <code>{getContextUrl(context)}</code>
      </p>
      {attrs.page ? <SourceCode page={attrs.page} /> : null}
    </div>
  )
}

export default StatusPage
