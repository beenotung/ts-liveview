import browserify from 'browserify'
import fs from 'fs'
import path from 'path'
import qs from 'querystring'

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

export type ClientParams = {
  pathname: string
  hash: string
  url: string
  search: string
  query: object | any
}

export function parseQuery(query: object | any): ClientParams {
  let pathname = query.pathname || '/'
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname
  }
  let hash = query.hash || ''
  if (hash && !hash.startsWith('#')) {
    hash = '#' + hash
  }
  query = Object.assign({}, query)
  delete query.pathname
  delete query.hash
  delete query._primuscb
  const search = qs.encode(query)
  let url = pathname
  if (search) {
    url += '?' + search
  }
  url += hash
  return {
    url,
    pathname,
    hash,
    search,
    query,
  }
}
