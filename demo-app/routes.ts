import UrlPattern from 'url-pattern'

export const functions = {
  Home: false,
  Booking: true,
  ShopList: true,
  Page3: false,
}
export type AppFunction = keyof typeof functions

const urls: Partial<Record<AppFunction, string>> = {}

export function route(name: AppFunction) {
  return urls[name] || '#/' + name.toLowerCase()
}

export const routes = {
  shops: new UrlPattern('/shop'),
  shop: new UrlPattern('/shop/:shopId'),
  service: new UrlPattern('/shop/:shopId/service/:serviceId'),
}
