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
`
