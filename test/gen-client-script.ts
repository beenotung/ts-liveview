import fs from 'fs'
import path from 'path'
import { genClientCode } from '../src'

const file = path.join('dist', 'client.js')
genClientCode().then(code => {
  fs.writeFileSync(file, code)
  console.log('saved to', file)
})
