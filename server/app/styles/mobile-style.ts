import { readFileSync } from 'fs'

export let MobileStyle = /* css */ `
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

${readFileSync('public/theme.css')}

/* fix */
ion-button[fill][color="primary"] {
  --background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}
ion-button[fill][color="tertiary"] {
  --background: var(--ion-color-tertiary);
  color: var(--ion-color-tertiary-contrast);
}
ion-button[fill][color="success"] {
  --background: var(--ion-color-success);
  color: var(--ion-color-success-contrast);
}
`
