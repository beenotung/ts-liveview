import { NodeList } from '../jsx/types.js'

export function Button(
  attrs: {
    url: string
    class?: string
    style?: string
    children?: NodeList
    disabled?: boolean
  } & object,
) {
  let { url, children, disabled, ...rest } = attrs
  return [
    'button',
    {
      'data-url': url,
      'onclick': 'emit(this.dataset.url)',
      'disabled': disabled ? '' : undefined,
      ...rest,
    },
    children,
  ]
}
