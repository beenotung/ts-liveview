import sanitize from 'sanitize-html'

export function sanitizeScriptInHTML(html: string) {
  return sanitize(html, {
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      '*': ['style', 'class'],
    },
    allowedTags: [...sanitize.defaults.allowedTags, 'img'],
  })
}
