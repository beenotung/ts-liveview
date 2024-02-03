import { o } from '../jsx/jsx.js'
import { IonTabBar } from './ion-tab-bar.js'

export let appIonTabBar = (
  <IonTabBar
    tabs={[
      {
        icon: 'home',
        label: 'Home',
        href: '/app/home',
      },
      {
        tab: 'chat',
        ios: 'chatbubble',
        md: 'chatbox',
        label: 'Chat',
        href: '/app/chat',
      },
      {
        tab: 'notice',
        icon: 'notifications',
        label: 'Notice',
        href: '/app/notice',
      },
      {
        tab: 'more',
        icon: 'ellipsis-horizontal',
        label: 'More',
        href: '/app/more',
      },
    ]}
  />
)
