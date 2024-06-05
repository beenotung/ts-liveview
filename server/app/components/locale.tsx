import { Context, getContextLanguage } from '../context.js'
import { Node } from '../jsx/types.js'

export type LocaleVariants<T = string> = {
  en: T
  zh: T
}

export function LocaleContent<T>(
  attrs: {
    variants: LocaleVariants<T>
  },
  context: Context,
) {
  return isPreferZh(context) ? attrs.variants.zh : attrs.variants.en
}

export function isPreferZh(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK|CN/i) && !lang?.match(/en/i)
}

export function Locale(attrs: { en: Node; zh: Node }, context: Context) {
  return isPreferZh(context) ? attrs.zh : attrs.en
}
