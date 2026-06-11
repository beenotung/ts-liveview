import type { Raw } from '../jsx/types'
import type { Context } from '../context'
import { Locale, LocaleVariants } from './locale.js'

/** For HTML comment */
export function Comment(text: string): Raw
export function Comment(attrs: LocaleVariants<string>, context: Context): Raw
export function Comment(
  text: string | LocaleVariants<string>,
  context?: Context,
): Raw {
  if (typeof text !== 'string') {
    text = Locale(text, context!)
  }
  return ['raw', `<!-- ${text} -->`]
}

export default Comment
