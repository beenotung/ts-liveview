import { Context, getContextLanguage } from '../context.js'
import { Node } from '../jsx/types.js'

export type LocaleVariants<T = Node> = {
  en: T
  zh: T
}

export function isPreferZh(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK|CN/i) && !lang?.match(/en/i)
}

export function Locale<T extends Node>(
  attrs: LocaleVariants<T>,
  context: Context,
): T {
  return isPreferZh(context) ? attrs.zh : attrs.en
}
