export function wrapMobileHTML(body: string, title?: string) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">
  ${title ? `<title>${title}</title>` : ''}
</head>
<body>
${body}
</body>
</html>`
}

const separator_pattern = '__separator__'
export const [mobile_html_pre, mobile_html_post] = wrapMobileHTML(
  separator_pattern,
).split(separator_pattern)

export function getIsHTMLDoc(html: string): boolean {
  const s = html.trimLeft()
  return !!(s.match(/^<!DOCTYPE html>/i) || s.match(/^<html/i))
}
