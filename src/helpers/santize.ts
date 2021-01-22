import sanitize from 'sanitize-html'

export function sanitizeHTML(html: string) {
  sanitize(html, {
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      '*': ['style', 'class'],
    },
  })
}
