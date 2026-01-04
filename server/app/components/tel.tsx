import {
  format_mobile_phone,
  to_full_mobile_phone,
} from '@beenotung/tslib/tel.js'
import { o } from '../jsx/jsx.js'

export function Tel(tel: string) {
  let full_tel = to_full_mobile_phone(tel)
  if (!full_tel) return null
  let formatted_tel = format_mobile_phone(full_tel)
  return <a href={'tel:' + full_tel}>{formatted_tel}</a>
}

export function formatTel(tel: string | null): string | null {
  if (!tel) return null
  return format_mobile_phone(tel)
}
