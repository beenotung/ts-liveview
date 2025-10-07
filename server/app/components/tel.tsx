import { o } from '../jsx/jsx.js'

export function Tel(tel: string): string {
  tel = tel.replace('+852', '')
  return <a href={'tel:' + tel}>{tel.slice(0, 4) + ' ' + tel.slice(4)}</a>
}

export function formatTel(tel: string | null): string | null {
  if (!tel) return null
  tel = tel.replace('+852', '')
  return tel.slice(0, 4) + ' ' + tel.slice(4)
}
