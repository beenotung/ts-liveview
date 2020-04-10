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

export function autoWrapMobileHTML(html: string) {
  const s = html.trimLeft()
  if (s.match(/^<!DOCTYPE html>/i) || s.match(/^<html/i)) {
    return html
  }
  return wrapMobileHTML(html)
}
