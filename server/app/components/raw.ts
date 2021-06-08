import type { Raw } from '../jsx/types'

export function Raw(html: string): Raw {
  return ['raw', html]
}
