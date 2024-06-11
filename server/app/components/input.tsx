export function Input(
  attrs: {
    tagName?: string
    url: string
    value: string | number | null
    type?: 'text' | 'number' | 'tel' | 'email' | 'url' | 'search'
    inputmode?:
      | 'none'
      | 'text'
      | 'decimal'
      | 'numeric'
      | 'tel'
      | 'search'
      | 'email'
      | 'url'
    step?: string
    style?: string
    class?: string
  } & object,
) {
  let { tagName, url, ...rest } = attrs
  return [
    tagName || 'input',
    {
      'data-url': url,
      'onchange': 'emit(this.dataset.url,this.value)',
      ...rest,
    },
  ]
}
