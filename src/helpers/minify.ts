/**
 * @warning has bug
 * This implementation is not context-aware.
 * Hence it may not handle well on strings in javascript/css
 * */
function removeComment(html: string) {
  for (;;) {
    let s = html

    s = s
      /* single-line js comment */
      .replace(/\s\/\/.*?\n/g, '\n')
      .replace(/\n\/\/.*?\n/g, '\n')
      /* multi-line js comment */
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      /* html comment */
      .replace(/<!--[\s\S]*?-->/g, '')

    if (s === html) {
      return s
    }
    html = s
  }
}

/**
 * @warning this is very aggressive
 * it remove all whitespaces
 * hence it will breaks pre and elements with whitespace css rule
 *
 * Also, it is not context-aware, hence may not handle well on strings in javascript/css
 * */
export function minify(html: string): string {
  // return html
  html = removeComment(html)
  for (;;) {
    let s = html

    function trim(p: string, c: string) {
      s = s
        .replace(new RegExp(p + c, 'g'), c)
        .replace(new RegExp(c + p, 'g'), c)
    }

    // trim lines
    s = s
      .split('\n')
      .map(s => s.trim())
      .filter(s => s)
      .join('\n')

    // compact lines
    trim('\n', ';')
    trim('\n', ':')
    trim('\n', ',')
    trim('\n', '{')
    // trim('\n', '}')
    trim('\n', '&&')
    s = s
      .replace(/\(\n/g, '(')

      .replace(/\n\)/g, ')')

      .replace(/\?\n/g, '?')
      .replace(/\n\?/g, '?')

      .replace(/\|\|\n/g, '||')
      .replace(/\n\|\|/g, '||')

      .replace(/\n}/g, '}')

    // trim space
    trim(' ', ';')
    trim(' ', ':')
    trim(' ', ',')
    trim(' ', '{')
    trim(' ', '}')
    trim(' ', '&&')
    trim(' ', '=')
    trim(' ', '==')
    trim(' ', '===')
    trim(' ', '!=')
    trim(' ', '!==')
    trim(' ', '!===')
    s = s
      .replace(/\s\s/g, ' ')

      .replace(/\(\s/g, '(')
      .replace(/ \(/g, '(')

      .replace(/\) /g, ')')
      .replace(/\s\)/g, ')')

      .replace(/\s\?/g, '?')
      .replace(/\?\s/g, '?')

      .replace(/\|\|\s/g, '||')
      .replace(/\s\|\|/g, '||')

    if (s === html) {
      return s
    }
    html = s
  }
}
