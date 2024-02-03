import { readFileSync } from 'fs'
import { Script } from '../components/script.js'
import debug from 'debug'

let log = debug('mobile-style.ts')
log.enabled = true

export let MobileStyle = /* css */ `
/* animation */
ion-app {
  min-height: 100%;
  transition: all 0.3s ease;
  opacity: 1;
}
ion-app.hide {
  opacity: 0;
}
@media (prefers-reduced-motion: no-preference) {
  ion-app {
    transform: translate(0,0);
  }
  .ios ion-app.hide {
    transform: translate(100%,0);
  }
  .ios .back ion-app.hide {
    transform: translate(-100%,0);
  }
  .md ion-app.hide {
    transform: translate(0,100%);
  }
  .md .back ion-app.hide {
    transform: translate(0,-100%);
  }
}
ion-app.no-animation {
  transition: none;
  transform: none;
}
#ws_status {
  transition: all 0.3s ease;
}
`

export let mobile_switch_page_no_animation_script = Script(/* javascript */ `
  document.body.classList.remove('back')
`)

export let mobile_switch_page_animation_script = Script(/* javascript */ `
document.querySelector('ion-app')?.classList.add('hide')
setTimeout(()=>{
  document.querySelector('ion-app')?.classList.remove('hide')
  document.body.classList.remove('back')
}, 1)
`)

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
async function fitIonFooter() {
  let ionFooter = document.querySelector('ion-footer')
  if (!ionFooter) return
  let sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  await sleep(1)
  while (true) {
    if (!ionFooter.closest('body')) return
    let rect = ionFooter.getBoundingClientRect();
    if (rect.height == 0) {
      await sleep(10)
      continue
    }
    if (ws_status) {
      let style = document.createElement('style')
      style.innerHTML =
        '#ws_status{margin-bottom:calc('+rect.height+'px - 0.5rem)}'
      + '.ws_status--safe-area{margin-top: 2.5rem;}'
      ionFooter.appendChild(style)
    }
    break
  }
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

export let fitIonFooter = [
  'raw',
  /* html */
  `<script>fitIonFooter()</script>`,
]

export function selectIonTab(tabName: string) {
  return [
    'raw',
    /* html */
    `<script>selectIonTab("${tabName}")</script>`,
  ]
}
