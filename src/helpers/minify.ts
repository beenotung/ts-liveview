/**
 * @warning this is very aggressive
 * it remove all whitespaces
 * hence it will breaks pre and elements with whitespace css rule
 * */
export function minify(html: string): string {
  // return html
  for (;;) {
    let s = html

    function trim(p: string, c: string) {
      s = s
        .replace(new RegExp(p + c, 'g'), c)
        .replace(new RegExp(c + p, 'g'), c)
    }

    // remove comments
    s = s
      /* single-line js comment */
      .replace(/\s\/\/.*?\n/g, '\n')
      .replace(/\n\/\/.*?/g, '\n')
      /* multi-line js comment */
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      /* html comment */
      .replace(/<!--[\s\S]*?-->/g, '')

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
