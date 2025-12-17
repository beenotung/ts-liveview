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
.no-animation ion-app {
  transition: none;
  transform: none;
}
#ws_status {
  transition: all 0.3s ease;
}

/* general */
hr {
  background-color: var(--ion-color-dark);
}
h1 {
  color: var(--ion-color-primary);
}
ion-title.ios {
  min-width: fit-content;
  padding-inline: unset;
}
.padding-half {
  --ion-padding: 8px;
}
.margin-half {
  --ion-margin: 8px;
}

ion-item.with-checkbox {
  user-select: none;
}
`

let themeStyle = readFileSync('public/theme.css').toString()
MobileStyle += themeStyle

export let themeColorNames: string[] = []

MobileStyle += /* css */ `
/* fix */`

themeStyle.match(/--ion-color-(\w+):/g)?.forEach(part => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let name = part.match(/--ion-color-(\w+):/)![1]
  if (themeColorNames.includes(name)) return
  themeColorNames.push(name)
  MobileStyle += /* css */ `
ion-button[fill][color="${name}"] {
  --background: var(--ion-color-${name});
  color: var(--ion-color-${name}-contrast);
}`
})

export let preIonicAppScript = Script(/* javascript */ `
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
      + '.ws_status--safe-area{margin-top: 2.75rem;}'
      ionFooter.appendChild(style)
    }
    break
  }
}
function selectIonTab(tab) {
  let ionTab = document.querySelector('ion-tab-bar ion-tab-button[tab="'+tab+'"]')
  if (!ionTab) return
  let ionIcon = ionTab.querySelector('ion-icon')
  if (!ionIcon) return
  ionTab.classList.add('tab-selected')
  if (ionIcon.name) ionIcon.name = ionIcon.name.replace('-outline', '')
  if (ionIcon.ios) ionIcon.ios = ionIcon.ios.replace('-outline', '')
  if (ionIcon.md) ionIcon.md = ionIcon.md.replace('-outline', '')
}
function afterNavigation() {
  let body = document.body
  if (body.classList.contains('no-animation')) {
    body.classList.remove('no-animation')
    body.classList.remove('back')
    return
  }
  let app = body.querySelector('ion-app')
  app.classList.add('hide')
  setTimeout(()=>{
    app.classList.remove('hide')
    body.classList.remove('back')
  },1)
}
// auto toggle ion-checkbox in ion-item with class "with-checkbox"
function autoToggleCheckboxInItem() {
  window.addEventListener('click', event => {
    let item = event.target.closest('ion-item')
    if (!item) return
    if (!item.classList.contains('with-checkbox')) return

    let checkbox = item.querySelector('ion-checkbox')

    // Don't trigger if clicking on the checkbox itself (it has its own handler)
    if (event.target === checkbox || checkbox.contains(event.target)) {
      return
    }

    // Toggle the checkbox
    checkbox.checked = !checkbox.checked;

    // Trigger the ionChange event manually
    const ionChangeEvent = new CustomEvent('ionChange', {
      detail: { checked: checkbox.checked },
      bubbles: true
    });
    checkbox.dispatchEvent(ionChangeEvent);
  })
  window.autoToggleCheckboxInItem_ = 1
}
if (!window.autoToggleCheckboxInItem_) {
  autoToggleCheckboxInItem()
}
`)

export let postIonicAppScript = Script(/* javascript */ `
afterNavigation()
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
