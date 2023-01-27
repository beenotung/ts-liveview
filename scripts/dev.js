#!/usr/bin/env node

import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import debug from 'debug'

let log = debug('ts-liveview dev')
log.enabled = true

let mode = process.argv[2]

if (mode != 'build' && mode != 'serve') {
  console.log('Please specify a mode: build or serve')
  process.exit(1)
}

main()

let stop = () => {}

if (mode === 'serve') {
  process.stdin.on('data', chunk => {
    if (chunk.toString().trim() == 'rs') {
      log('manual restarting...')
      stop()
      main()
    }
  })
}

async function main() {
  log('scanning files...')
  let files = scan()
  if (mode == 'build') {
    log('building', files.length, 'files...')
  } else if (mode == 'serve') {
    log('watching', files.length, 'files...')
  }
  build(files)
}

function scan() {
  let files = []

  function scanDir(dir) {
    fs.readdirSync(dir).forEach(filename => {
      if (filename == 'node_modules') return
      let file = path.join(dir, filename)
      let stat = fs.statSync(file)
      if (stat.isDirectory()) {
        scanDir(file)
        return
      }
      if (stat.isFile()) {
        let ext = path.extname(filename)
        if (ext == '.ts' || ext == '.tsx') {
          files.push(file)
        }
      }
    })
  }

  scanDir('server')
  scanDir('db')
  scanDir('client')
  scanDir('template')

  return files
}

async function build(files) {
  let result = await esbuild.build({
    entryPoints: files,
    outdir: './dist',
    platform: 'node',
    format: 'esm',
    jsx: 'transform',
    jsxFactory: 'o',
    jsxFragment: 'null',
    watch:
      mode == 'build'
        ? false
        : {
            onRebuild(error, result) {
              if (error) {
                log('watch build failed:', error)
                return
              }
              log('watch build success')
              postBuild()
            },
          },
  })
  stop = () => result.stop()
  postBuild()
  if (mode == 'build') {
    log('build finished')
  }
  if (mode == 'serve') {
    log('initial build finished')
    log(
      'You can type "rs <Enter>" to restart manually (e.g. after added new files)',
    )
  }
}

function postBuild() {
  fix()
  if (mode == 'serve') {
    restartServer()
  }
}

function fix() {
  let file = path.join('dist', 'db', 'proxy.js')
  let text = fs.readFileSync(file).toString()
  if (!text.includes(`import { db } from "./db"`)) return
  text = text.replace(
    `import { db } from "./db"`,
    `import { db } from "./db.js"`,
  )
  fs.writeFileSync(file, text)
}

let stopServer = async () => {}

let EPOCH = 0

async function restartServer() {
  await stopServer()
  log('starting server...')
  EPOCH++
  let server = child_process.spawn('node', ['dist/server/index.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EPOCH,
    },
  })
  stopServer = () =>
    new Promise(resolve => {
      log('stopping server...')
      server.on('close', resolve)
      server.kill()
    })
}
