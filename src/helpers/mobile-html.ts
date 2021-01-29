export type HTMLOptions = {
  lang?: string
  dir?: string
  title?: string
  heads?: string[]
}

export function wrapMobileHTML(body: string, options?: HTMLOptions) {
  const lang = options?.lang || 'en'
  const dir = options?.dir || 'ltr'
  const title = options?.title
  const heads = options?.heads
  return `<!DOCTYPE html>
<html lang='${lang}' dir='${dir}'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport'
        content='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'>
  <meta name='format-detection' content='telephone=no'>
  <meta name='msapplication-tap-highlight' content='no'>
  ${title ? `<title>${title}</title>` : ''}
  ${heads ? heads.join('') : ''}
</head>
<body>
${body}
</body>
</html>`
}

const separator_pattern = '__separator__'

export function genMobileHTMLWrapper(options: HTMLOptions): MobileHtmlWrapper {
  const res = wrapMobileHTML(separator_pattern, options).split(
    separator_pattern,
  )
  return {
    pre_body: res[0],
    post_body: res[1],
  }
}

export type MobileHtmlWrapper = {
  pre_body: string
  post_body: string
}

export function getIsHTMLDoc(html: string): boolean {
  const s = html.trimLeft()
  return !!(s.match(/^<!DOCTYPE html>/i) || s.match(/^<html/i))
}
