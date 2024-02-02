import { readFileSync } from 'fs'
import { Script } from '../components/script.js'
import debug from 'debug'

let log = debug('mobile-style.ts')
log.enabled = true

export let MobileStyle = /* css */ `
/* animation */
.page {
  min-height: 100%;
  transition: all 0.3s ease;
  opacity: 1;
}
.page.hide {
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  .page {
    transform: translate(0,0);
  }
  .ios .page.hide {
    transform: translate(100%,0);
  }
  .ios .back .page.hide {
    transform: translate(-100%,0);
  }
  .md .page.hide {
    transform: translate(0,100%);
  }
  .md .back .page.hide {
    transform: translate(0,-100%);
  }
}

`

let themeStyle = readFileSync('public/theme.css').toString()
MobileStyle += themeStyle

export let themeColorNames: string[] = []

MobileStyle += /* css */ `
/* fix */`

themeStyle.match(/--ion-color-(\w+):/g)?.forEach(part => {
  let name = part.match(/--ion-color-(\w+):/)![1]
  if (themeColorNames.includes(name)) return
  themeColorNames.push(name)
  MobileStyle += /* css */ `
ion-button[fill][color="${name}"] {
  --background: var(--ion-color-${name});
  color: var(--ion-color-${name}-contrast);
}`
})

export let ionicAppScript = Script(/* javascript */ `
function fitIonContent(ionContent) {
  let retry = () => setTimeout(() => fitIonContent(ionContent), 10)
  let rect = ionContent.getBoundingClientRect();
  if (rect.height == 0) return retry()
  let ionHeader = ionContent.previousElementSibling
  let ionFooter = ionContent.nextElementSibling
  let height = '100%'
  if (ionHeader?.matches('ion-header')) {
    let rect = ionHeader.getBoundingClientRect();
    if (rect.height == 0) return retry()
    height += ' - ' + rect.height + 'px'
  }
  if (ionFooter?.matches('ion-footer')) {
    let rect = ionFooter.getBoundingClientRect();
    if (rect.height == 0) return retry()
    height += ' - ' + rect.height + 'px'
    if (ws_status) {
      let style = document.createElement('style')
      style.innerHTML =
        '#ws_status{margin-bottom:calc('+rect.height+'px - 0.5rem)}'
      + '.ws_status--safe-area{margin-top: 2.5rem;}'
      ionContent.appendChild(style)
    }
  }
  ionContent.style.height = 'calc(' + height + ')'
}
function selectIonTab(tab) {
  let ionTab = document.querySelector('ion-tab-bar ion-tab-button[tab="'+tab+'"]')
  let ionIcon = ionTab.querySelector('ion-icon')
  ionTab.classList.add('tab-selected')
  if (ionIcon.name) ionIcon.name = ionIcon.name.replace('-outline', '')
  if (ionIcon.ios) ionIcon.ios = ionIcon.ios.replace('-outline', '')
  if (ionIcon.md) ionIcon.md = ionIcon.md.replace('-outline', '')
}
`)

export function fitIonContent(ionContentId: string) {
  let idStr = JSON.stringify(ionContentId)
  if (idStr != `"${ionContentId}"`) {
    log('avoid having special character in id')
    ionContentId = `document.getElementById(${idStr})`
  }
  return [
    'raw',
    /* html */
    `<script>fitIonContent(${ionContentId})</script>`,
  ]
}

export function selectIonTab(tabName: string) {
  return [
    'raw',
    /* html */
    `<script>selectIonTab("${tabName}")</script>`,
  ]
}
