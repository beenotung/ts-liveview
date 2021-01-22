import sanitize from 'sanitize-html'

export function preventScript(html: string) {
  if ('dev') {
    return sanitize(html, {
      allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        '*': ['style', 'class', 'href'],
      },
      sc,
    })
  }
  return html
    .replace(/<script>/g, '[script]')
    .replace(/<\/script>/g, '[/script]')
    .replace(/javascript:/g, '[javascript]')
}

console.log(
  preventScript(`
<a href="/123">
<a href="javascript:alert('hi')">
`),
)
