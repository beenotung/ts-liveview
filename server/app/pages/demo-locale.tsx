import { Locale, Title } from '../components/locale.js'
import SourceCode from '../components/source-code.js'
import { PickLanguage } from '../components/ui-language.js'
import { Context, getContextLanguage, getContextTimezone } from '../context.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'

let pageTitle = (
  <Locale en="Locale Demo" zh_hk="本地化設置示範" zh_cn="本地化设置示范" />
)

function DemoLocale(attrs: {}, context: Context) {
  let lang = getContextLanguage(context) || 'unknown'
  let timezone = getContextTimezone(context) || 'unknown'
  return (
    <div id="demo-locale">
      <h1>{pageTitle}</h1>
      <p>
        <Locale
          en="This page demo supporting users with multiple languages and timezones."
          zh_hk="此頁面示範支援多種語言和時區的使用者。"
          zh_cn="此页面示范支持多种语言和时区的用户。"
        />
      </p>
      <p>
        <Locale en="Current language:" zh_hk="目前語言：" zh_cn="目前语言：" />{' '}
        {lang}
      </p>
      <p>
        <Locale en="Current timezone:" zh_hk="目前時區：" zh_cn="目前时区：" />{' '}
        {timezone}
      </p>
      <PickLanguage />
      <p>
        <Locale
          en="You can switch the language in the page footer as well."
          zh_hk="您也可以在頁面底部切換語言。"
          zh_cn="您也可以在页面底部切换语言。"
        />
      </p>
      <SourceCode page="demo-locale.tsx" />
    </div>
  )
}

let routes = {
  '/locale': {
    menuText: <Locale en="Locale" zh_hk="本地化" zh_cn="本地化" />,
    title: <Title t={pageTitle} />,
    description: (
      <Locale
        en="Locale demo for multiple languages and timezone (i18n)"
        zh_hk="支援多種語言和時區 (i18n) 的本地化示例"
        zh_cn="支持多语言和时区 (i18n) 的本地化示例"
      />
    ),
    node: <DemoLocale />,
  },
} satisfies Routes

export default { routes }
