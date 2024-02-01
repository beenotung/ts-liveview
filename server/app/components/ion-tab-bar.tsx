import { o } from '../jsx/jsx.js'
import { mapArray } from './fragment.js'

export function IonTabBar(attrs: {
  tabs: {
    tab?: string
    icon: string
    label: string
  }[]
}) {
  return (
    <ion-tab-bar>
      {mapArray(attrs.tabs, (tab, i) => (
        <ion-tab-button tab={tab.tab || tab.icon || 'tab-' + (i + 1)}>
          <ion-icon name={tab.icon}></ion-icon>
          {tab.label}
        </ion-tab-button>
      ))}
    </ion-tab-bar>
  )
}
