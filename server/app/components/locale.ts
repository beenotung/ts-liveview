import { Context, getContextLanguage } from '../context.js'

export function LocaleContent(
  attrs: {
    variants: {
      en: any
      zh: any
    }
  },
  context: Context,
) {
  return isPreferZh(context) ? attrs.variants.zh : attrs.variants.en
}

export function isPreferZh(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK|CN/i) && !lang?.match(/en/i)
}
