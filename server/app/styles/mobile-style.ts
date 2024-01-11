import { readFileSync } from 'fs'

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
