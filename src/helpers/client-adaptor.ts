import browserify from 'browserify'
import path from 'path'
import fs from 'fs'

function getClientFile() {
  // ts-node version
  let tsNodeClientFile = path.join(__dirname, '..', '..', 'dist', 'src', 'helpers', 'client.js')
  // node version
  let nodeClientFile = path.join(__dirname, 'client.js')
  return fs.existsSync(tsNodeClientFile) ? tsNodeClientFile : nodeClientFile
}

export function genClientCode() {
  let b = browserify()
  b.add(getClientFile())
  return new Promise((resolve, reject) => {
    b.bundle((err, src) => {
      if (err) {
        reject(err)
        return
      }
      resolve(src.toString())
    })
  })
}

export let clientScript = genClientCode().then(code => `<script>${code}</script>`)
