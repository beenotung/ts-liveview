import { genClientCode } from '../src'
import path from 'path'
import fs from 'fs'

let file = path.join('dist', 'client.js')
genClientCode().then(code => {
  fs.writeFileSync(file, code)
  console.log('saved to', file)
})
