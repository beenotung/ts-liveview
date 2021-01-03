import fs from 'fs'
import { minifyHTML } from '../src/minify/html'

function test(file: string) {
  let code = fs.readFileSync(file).toString()
  code = minifyHTML(code)
  const ss = file.split('.')
  const ext = ss.pop()!
  ss.push('min', ext)
  file = ss.join('.')
  fs.writeFileSync(file, code)
  console.log('saved to', file)
}

test('dist/client.js')
test('primus.js')
test('res/minify.html')
