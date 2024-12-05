import { title } from '../../config.js'
import { Context, getContextLanguage } from '../context.js'
import { Component, Node } from '../jsx/types.js'

export type LocaleVariants<T = Node> = {
  en: T
  zh_hk: T
  zh_cn: T
}

export function isPreferZh(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK|CN/i) && !lang?.match(/en/i)
}

export function isPreferZhHK(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|HK/i) && !lang?.match(/en|CN/i)
}

export function isPreferZhCN(context: Context) {
  let lang = getContextLanguage(context)
  return lang?.match(/zh|CN/i) && !lang?.match(/en|HK/i)
}

export function Locale<T>(attrs: LocaleVariants<T>, context: Context): T {
  if (isPreferZhHK(context)) return attrs.zh_hk
  if (isPreferZhCN(context)) return attrs.zh_cn
  return attrs.en
}

export function Title(
  attrs: {
    t: Component<LocaleVariants<string>>
  },
  context: Context,
) {
  let component = attrs.t
  let variants = component[1] as LocaleVariants<string>
  let t = Locale(variants, context)
  return title(t)
}

export function evalAttrsLocale<T extends object>(
  attrs: T,
  key: keyof T,
  context: Context,
) {
  if (!(key in attrs)) return
  let value = attrs[key]
  if (!Array.isArray(value)) return
  let component = value[0]
  if (component === Locale || component === Title) {
    let variants = value[1] as LocaleVariants<string>
    attrs[key] = component(variants, context) as any
  }
}
