import { o } from '../jsx/jsx.js'
import { IonTabBar } from './ion-tab-bar.js'
import { Locale } from './locale.js'

export let appIonTabBar = (
  <IonTabBar
    tabs={[
      {
        icon: 'home',
        label: <Locale en="Home" zh_hk="主頁" zh_cn="主页" />,
        href: '/app/home',
      },
      {
        tab: 'chat',
        ios: 'chatbubble',
        md: 'chatbox',
        label: <Locale en="Chat" zh_hk="聊天" zh_cn="聊天" />,
        href: '/app/chat',
      },
      {
        tab: 'notice',
        icon: 'notifications',
        label: <Locale en="Notice" zh_hk="通知" zh_cn="通知" />,
        href: '/app/notice',
      },
      {
        tab: 'more',
        icon: 'ellipsis-horizontal',
        label: <Locale en="More" zh_hk="更多" zh_cn="更多" />,
        href: '/app/more',
      },
    ]}
  />
)
