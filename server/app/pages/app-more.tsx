import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { LayoutType, config, title } from '../../config.js'
import Style from '../components/style.js'
import { Link } from '../components/router.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { readFileSync } from 'fs'
import { LanguageRadioGroup } from '../components/language-radio-group.js'
import { Locale } from '../components/locale.js'
import { Context } from '../context.js'
import { getAuthUser } from '../auth/user.js'

let pageTitle = 'More'

let style = Style(/* css */ `
#More {

}
`)

let page = (
  <>
    {style}
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title role="heading" aria-level="1">
          {pageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="More" class="ion-padding">
      <ion-avatar
        style="
          margin:auto;
          height:128px;
          width :128px;
        "
      >
        <img src="https://picsum.photos/seed/logo/128/128" />
      </ion-avatar>
      <h2
        style="
          margin-top:0.25rem;
          text-align:center;
        "
      >
        {config.site_name}
      </h2>
      <ion-list>
        <ion-list-header aria-level="2">
          <ion-label>
            <ion-icon name="person" />{' '}
            <Locale en="Account" zh_hk="帳戶" zh_cn="账户" />
          </ion-label>
        </ion-list-header>
        <UserSection />
        <Link tagName="ion-item" href="/settings">
          <ion-icon slot="start" ios="cog" md="settings" />
          <ion-label>
            <Locale en="Settings" zh_hk="設定" zh_cn="设置" />
          </ion-label>
        </Link>

        <ion-list-header aria-level="2">
          <ion-label>
            <ion-icon name="language" />{' '}
            <Locale en="Language" zh_hk="語言" zh_cn="语言" />
          </ion-label>
        </ion-list-header>
        <LanguageRadioGroup />

        <ion-list-header aria-level="2">
          <ion-label>
            <ion-icon name="information" />{' '}
            <Locale en="Information" zh_hk="資訊" zh_cn="信息" />
          </ion-label>
        </ion-list-header>
        <Link tagName="ion-item" href="/app/about?from=more">
          <ion-icon slot="start" name="logo-ionic" />
          <ion-label>
            <Locale en="About Us" zh_hk="關於我們" zh_cn="关于我们" />
          </ion-label>
        </Link>
        <Link tagName="ion-item" href="/terms" disabled>
          <ion-icon slot="start" name="book" />
          <ion-label>
            <Locale
              en="Terms and Conditions"
              zh_hk="使用條款"
              zh_cn="使用条款"
            />
          </ion-label>
        </Link>
        <Link tagName="ion-item" href="/privacy" disabled>
          <ion-icon slot="start" name="glasses" />
          <ion-label>
            <Locale en="Privacy Policy" zh_hk="私隱政策" zh_cn="隐私政策" />
          </ion-label>
        </Link>
        <ion-item>
          <ion-icon slot="start" name="server" />
          <ion-label>
            <Locale en="Version" zh_hk="版本" zh_cn="版本" />{' '}
            {JSON.parse(readFileSync('package.json').toString()).version}
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      {appIonTabBar}
      {selectIonTab('more')}
    </ion-footer>
    {fitIonFooter}
  </>
)

function UserSection(attrs: {}, context: Context) {
  let user = getAuthUser(context)
  return (
    <>
      {user ? (
        <>
          <Link tagName="ion-item" href="/profile">
            <ion-icon slot="start" name="person" />
            <ion-label>
              <Locale en="Profile" zh_hk="個人資料" zh_cn="个人资料" />
            </ion-label>
          </Link>
        </>
      ) : (
        <>
          <Link tagName="ion-item" href="/login">
            <ion-icon slot="start" name="log-in" />
            <ion-label>
              <Locale
                en="Login / Sign up"
                zh_hk="登入 / 註冊"
                zh_cn="登录 / 注册"
              />
            </ion-label>
          </Link>
        </>
      )}
    </>
  )
}

let routes = {
  '/app/more': {
    title: title(pageTitle),
    description: 'TODO',
    node: page,
    layout_type: LayoutType.ionic,
  },
} satisfies Routes

export default { routes }
