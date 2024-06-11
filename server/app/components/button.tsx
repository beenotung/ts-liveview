import { NodeList } from '../jsx/types.js'

export function Button(
  attrs: {
    url: string
    class?: string
    style?: string
    children?: NodeList
  } & object,
) {
  let { url, children, ...rest } = attrs
  return [
    'button',
    {
      'data-url': url,
      'onclick': 'emit(this.dataset.url)',
      ...rest,
    },
    children,
  ]
}
