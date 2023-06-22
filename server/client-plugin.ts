import * as esbuild from 'esbuild'
import * as path from 'path'
import { config } from './config.js'

export function loadClientPlugin(options: {
  // e.g. dist/client/image.js
  entryFile: string
  // e.g. image.bundle.js
  outFilename?: string
}) {
  let { entryFile } = options
  if (!entryFile.startsWith('dist/client/')) {
    throw new Error('the entryFile should be in dist/client directory')
  }
  if (!entryFile.endsWith('.js')) {
    throw new Error('the entryFile should .js file')
  }

  let outFilename = options.outFilename || defaultBundleFilename(entryFile)

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
  let scriptSrc = 'js/' + outFilename

  let script = /* html */ `<script src="${scriptSrc}"></script>`

  return { script }
}

function defaultBundleFilename(entryFile: string) {
  let filename = path.basename(entryFile)
  return filename.replace(/\.js$/, '.bundle.js')
}
