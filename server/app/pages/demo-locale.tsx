import { isPreferZh } from '../components/locale.js'
import SourceCode from '../components/source-code.js'
import { PickLanguage } from '../components/ui-language.js'
import { Context, getContextLanguage, getContextTimezone } from '../context.js'
import { o } from '../jsx/jsx.js'

function DemoLocale(_attrs: {}, context: Context) {
  let lang = getContextLanguage(context) || 'unknown'
  let timezone = getContextTimezone(context) || 'unknown'
  return (
    <div id="demo-locale">
      {isPreferZh(context) ? Zh({ lang, timezone }) : En({ lang, timezone })}
      <SourceCode page="demo-locale.tsx" />
    </div>
  )
}

function En(attrs: { lang: string; timezone: string }) {
  return (
    <>
      <h1>Demo Locale</h1>
      <p>
        This page demo supporting users with multiple langues and timezones.
      </p>
      <p>Current language: {attrs.lang}</p>
      <p>Current timezone: {attrs.timezone}</p>
      <PickLanguage />
      <p>You can switch the language in the page footer as well.</p>
    </>
  )
}

function Zh(attrs: { lang: string; timezone: string }) {
  return (
    <>
      <h1>本地化設置示範</h1>
      <p>此頁面示範支援多種語言和時區的使用者。</p>
      <p>目前語言：{attrs.lang}</p>
      <p>目前時區：{attrs.timezone}</p>
      <PickLanguage />
      <p>您也可以在頁面底部切換語言。</p>
    </>
  )
}

export default DemoLocale
