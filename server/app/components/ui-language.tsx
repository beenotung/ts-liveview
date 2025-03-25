import {
  Context,
  DynamicContext,
  getContextLanguage,
  getContextSearchParams,
} from '../context.js'
import { o } from '../jsx/jsx.js'
import { ResolvedPageRoute, Routes } from '../routes.js'
import { Raw } from './raw.js'
import { apiEndpointTitle } from '../../config.js'
import { toRouteUrl } from '../../url.js'
import { Redirect } from './router.js'
import { Locale } from './locale.js'
import { mapArray } from './fragment.js'

export function PickLanguage(attrs: { style?: string }, context: Context) {
  let lang = getContextLanguage(context)
  let return_url = context.type == 'static' ? '' : context.url
  return (
    <div style={attrs.style}>
      🌏 <Locale en="Language" zh_hk="語言" zh_cn="语言" />:{' '}
      {mapArray(
        [
          ['en', 'English'],
          ['zh-HK', '繁體中文'],
          ['zh-CN', '简体中文'],
        ],
        ([lang, text]) => (
          <a
            onclick={`switchLang(event, '${lang}')`}
            href={toRouteUrl(routes, '/set-lang/:lang', {
              params: { lang },
              query: { return_url },
            })}
          >
            <button>{text}</button>
          </a>
        ),
        ' | ',
      )}
      {Raw(/* html */ `
<script>
function switchLang(event, lang){
  document.cookie = 'lang=' + lang + ';SameSite=Lax;path=/'
  remount()
  event.preventDefault()
}
</script>
`)}
    </div>
  )
}

function submit(context: DynamicContext): ResolvedPageRoute {
  let lang = context.routerMatch?.params.lang
  let return_url = getContextSearchParams(context)?.get('return_url')
  if (context.type == 'express') {
    context.res.cookie('lang', lang, {
      sameSite: 'lax',
      path: '/',
    })
  } else {
    let cookie = 'lang=' + lang + ';SameSite=Lax;path=/'
    context.ws.send(['set-cookie', cookie])
  }
  return {
    title: apiEndpointTitle,
    description: 'set the locale language',
    node: return_url ? (
      <Redirect href={return_url} />
    ) : (
      <p>Updated language preference.</p>
    ),
  }
}

let routes = {
  '/set-lang/:lang': {
    streaming: false,
    resolve: submit,
  },
} satisfies Routes

export default { routes }
