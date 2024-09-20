import { Context, DynamicContext, getContextLanguage } from '../context.js'
import { o } from '../jsx/jsx.js'
import { ResolvedPageRoute, Routes, getContextSearchParams } from '../routes.js'
import { Raw } from './raw.js'
import { apiEndpointTitle } from '../../config.js'
import { toRouteUrl } from '../../url.js'
import { Redirect } from './router.js'

export function PickLanguage(attrs: { style?: string }, context: Context) {
  let lang = getContextLanguage(context)
  let return_url = context.type == 'static' ? '' : context.url
  return (
    <div style={attrs.style}>
      {lang === 'zh' ? 'Language' : '界面語言'}:{' '}
      <a
        onclick="switchLang(event, 'zh')"
        href={toRouteUrl(routes, '/set-lang/:lang', {
          params: { lang: 'zh' },
          query: { return_url },
        })}
      >
        <button>繁體中文</button>
      </a>{' '}
      |{' '}
      <a
        onclick="switchLang(event, 'en')"
        href={toRouteUrl(routes, '/set-lang/:lang', {
          params: { lang: 'en' },
          query: { return_url },
        })}
      >
        <button>English</button>
      </a>
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
  let return_url = getContextSearchParams(context).get('return_url')
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
