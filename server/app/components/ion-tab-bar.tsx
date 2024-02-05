import { o } from '../jsx/jsx.js'
import { mapArray } from './fragment.js'
import { Link } from './router.js'

export function IonTabBar(attrs: {
  tabs: {
    tab?: string
    icon?: string
    ios?: string
    md?: string
    label: string
    href: string
  }[]
}) {
  return (
    <ion-tab-bar>
      {mapArray(attrs.tabs, (tab, i) => {
        return (
          <Link
            tagName="ion-tab-button"
            no-animation
            href={tab.href}
            tab={tab.tab || tab.icon || 'tab-' + (i + 1)}
          >
            <ion-icon
              name={toOutline(tab.icon)}
              ios={toOutline(tab.ios)}
              md={toOutline(tab.md)}
            />
            {tab.label}
          </Link>
        )
      })}
    </ion-tab-bar>
  )
}

function toOutline(name: string | undefined) {
  if (!name) return
  if (name.endsWith('-outline')) return name
  return name + '-outline'
}
