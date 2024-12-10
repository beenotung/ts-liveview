import * as esbuild from 'esbuild'
import * as path from 'path'
import { config } from './config.js'
import { Raw } from './app/components/raw.js'
import { Raw as RawType } from './app/jsx/types.js'

let cache = new Map<string, { script: string; node: RawType }>()

export function loadClientPlugin(options: {
  // e.g. dist/client/image.js
  entryFile: string
  // e.g. image.bundle.js
  outFilename?: string
  async?: boolean
  onload?: string
}) {
  let { entryFile } = options
  if (!entryFile.startsWith('dist/client/')) {
    throw new Error('the entryFile should be in dist/client directory')
  }
  if (!entryFile.endsWith('.js')) {
    throw new Error('the entryFile should .js file')
  }

  let outFilename = options.outFilename || defaultBundleFilename(entryFile)

  let key = entryFile + '|' + outFilename

  let result = cache.get(key)
  if (result) {
    return result
  }

  // e.g. build/image.bundle.js
  let outFile = 'build/' + outFilename

  esbuild.buildSync({
    entryPoints: [entryFile],
    outfile: outFile,
    bundle: true,
    minify: config.production,
    target: config.client_target,
  })

  // e.g. js/image.bundle.js
  let scriptSrc = '/js/' + outFilename

  let script = /* html */ `<script src="${scriptSrc}" ${options.async ? 'async defer' : ''} ${options.onload ? `onload=` + JSON.stringify(options.onload) : ''}></script>`

  let node = Raw(script)

  result = { script, node }

  cache.set(key, result)
  return result
}

function defaultBundleFilename(entryFile: string) {
  let filename = path.basename(entryFile)
  return filename.replace(/\.js$/, '.bundle.js')
}
