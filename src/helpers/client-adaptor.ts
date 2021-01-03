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

/**@deprecated TODO remove this */
export function genClientCode() {
  if ('dev') {
    return Promise.resolve('')
  }
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

export let clientScriptCode = genClientCode()
export let clientScriptTag = clientScriptCode.then(
  code => `<script>${code}</script>`,
)
