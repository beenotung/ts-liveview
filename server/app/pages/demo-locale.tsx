import { title } from '../../config.js'
import { Locale, isPreferZh } from '../components/locale.js'
import SourceCode from '../components/source-code.js'
import { PickLanguage } from '../components/ui-language.js'
import { Context, getContextLanguage, getContextTimezone } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

function DemoLocale(attrs: {}, context: Context) {
  let lang = getContextLanguage(context) || 'unknown'
  let timezone = getContextTimezone(context) || 'unknown'
  return (
    <div id="demo-locale">
      <h1>
        <Locale en="Locale Demo" zh="本地化設置示範" />
      </h1>
      <p>
        <Locale
          en="This page demo supporting users with multiple languages and timezones."
          zh="此頁面示範支援多種語言和時區的使用者。"
        />
      </p>
      <p>
        <Locale en="Current language:" zh="目前語言：" /> {lang}
      </p>
      <p>
        <Locale en="Current timezone:" zh="目前時區：" /> {timezone}
      </p>
      <PickLanguage />
      <p>
        <Locale
          en="You can switch the language in the page footer as well."
          zh="您也可以在頁面底部切換語言。"
        />
      </p>
      <SourceCode page="demo-locale.tsx" />
    </div>
  )
}

let routes = {
  '/locale': {
    menuText: <Locale en="Locale" zh="本地化" />,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: title(zh ? '本地化設置示範' : 'Locale Demo'),
        description: zh
          ? '示範支援多種語言和時區 (i18n)'
          : 'Locale demo for multiple languages and timezone (i18n)',
        node: <DemoLocale />,
      }
    },
  },
} satisfies Routes

export default { routes }
