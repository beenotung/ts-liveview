import { NodeList } from '../jsx/types.js'

export function IonButton(
  attrs: {
    url: string
    class?: string
    style?: string
    children?: NodeList
    disabled?: boolean
    color?: string
    shape?: string
  } & object,
) {
  let { url, children, disabled, ...rest } = attrs
  return [
    'ion-button',
    {
      'data-url': url,
      'onclick': 'emit(this.dataset.url)',
      'disabled': disabled ? '' : undefined,
      ...rest,
    },
    children,
  ]
}
