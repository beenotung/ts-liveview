import browserify from 'browserify'
import fs from 'fs'
import path from 'path'

function getClientFile() {
  // ts-node version
  const tsNodeClientFile = path.join(
    __dirname,
    '..',
    '..',
    'dist',
    'src',
    'helpers',
    'client.js',
  )
  // node version
  const nodeClientFile = path.join(__dirname, 'client.js')
  return fs.existsSync(tsNodeClientFile) ? tsNodeClientFile : nodeClientFile
}

export function genClientCode() {
  const b = browserify()
  b.add(getClientFile())
  return new Promise((resolve, reject) => {
    b.bundle((err, src) => {
      if (err) {
        console.error('failed to bundle client code:', err)
        reject(err)
        return
      }
      resolve(src.toString())
    })
  })
}

export let clientScript = genClientCode().then(
  code => `<script>${code}</script>`,
)
