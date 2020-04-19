import UrlPattern from 'url-pattern'

export const functions = {
  About: true,
  Editor: true,
  Form: true,
  'Nested Pages': true,
  'Ultimate Answer': false,
  Calculator: true,
}
export type AppFunction = keyof typeof functions

const urls: Partial<Record<AppFunction, string>> = {}

export function route(name: AppFunction) {
  return (urls[name] || '#/' + name.toLowerCase()).replace(/ /g, '-')
}

export const routes = {
  shops: new UrlPattern('/shop'),
  shop: new UrlPattern('/shop/:shopId'),
  service: new UrlPattern('/shop/:shopId/service/:serviceId'),
}
