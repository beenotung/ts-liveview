import { title } from '../../config.js'
import { isPreferZh } from '../components/locale.js'
import SourceCode from '../components/source-code.js'
import { PickLanguage } from '../components/ui-language.js'
import { Context, getContextLanguage, getContextTimezone } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Node } from '../jsx/types.js'
import { Routes } from '../routes.js'

function DemoLocale(attrs: { main: Node }) {
  return (
    <div id="demo-locale">
      {attrs.main}
      <SourceCode page="demo-locale.tsx" />
    </div>
  )
}

function En(attrs: { lang: string; timezone: string }) {
  return (
    <>
      <h1>Locale Demo</h1>
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

let routes = {
  '/locale': {
    menuText: 'Locale',
    resolve(context) {
      let lang = getContextLanguage(context) || 'unknown'
      let timezone = getContextTimezone(context) || 'unknown'
      return isPreferZh(context)
        ? {
            title: title('本地化設置示範'),
            description: '示範支援多種語言和時區 (i18n)',
            node: <DemoLocale main={Zh({ lang, timezone })} />,
          }
        : {
            title: title('Locale Demo'),
            description:
              'Locale demo for multiple languages and timezone (i18n)',
            node: <DemoLocale main={En({ lang, timezone })} />,
          }
    },
  },
} satisfies Routes

export default { routes }
