import { writeFileSync } from 'fs'
import { LocaleVariants } from './components/locale.js'

export let theme_color = '#000000'
export let background_color = '#ffffff'

export let manifest_files: LocaleVariants<string> = {
  en: '/pwa/manifest-en.json',
  zh_hk: '/pwa/manifest-zh-hk.json',
  zh_cn: '/pwa/manifest-zh-cn.json',
}

export let site_names: LocaleVariants<string> = {
  en: 'ts-liveview Demo',
  zh_hk: 'ts-liveview 示範',
  zh_cn: 'ts-liveview 示例',
}

export let short_site_names: LocaleVariants<string> = {
  en: 'Demo',
  zh_hk: '示範',
  zh_cn: '示例',
}

for (let [_lang, url] of Object.entries(manifest_files)) {
  let lang = _lang as keyof typeof manifest_files
  let file = 'public' + url
  let manifest = {
    name: site_names[lang],
    short_name: short_site_names[lang],
    start_url: '/',
    display: 'standalone',
    orientation: 'natural',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    background_color,
    theme_color,
  }
  writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n')
}
