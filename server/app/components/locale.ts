import { Context, getContextLanguage } from '../context.js'

export type LocaleVariants = {
  en: any
  zh: any
}

export function LocaleContent(
  attrs: {
    variants: LocaleVariants
  },
  context: Context,
) {
  return isPreferZh(context) ? attrs.variants.zh : attrs.variants.en
}

export function isPreferZh(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK|CN/i) && !lang?.match(/en/i)
}
