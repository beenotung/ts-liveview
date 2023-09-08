import { Context, getContextLanguage } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Raw } from './raw.js'

export function PickLanguage(attrs: { style?: string }, context: Context) {
  let lang = getContextLanguage(context)
  return (
    <div style={attrs.style}>
      {lang === 'zh' ? 'Language' : '界面語言'}:{' '}
      <button onclick="switchLang('zh')">繁體中文</button> |{' '}
      <button onclick="switchLang('en')">English</button>
      {Raw(/* html */ `
<script>
function switchLang(lang){
  document.cookie = 'lang=' + lang + ';SameSite=Lax'
  remount()
}
</script>
`)}
    </div>
  )
}
