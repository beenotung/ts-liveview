import type { Raw } from '../jsx/types'

/** For HTML comment */
export function Comment(text: string): Raw {
  return ['raw', `<!-- ${text} -->`]
}

export default Comment
