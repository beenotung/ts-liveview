#!/usr/bin/env node
'use strict'
import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import debug from 'debug'
let log = debug('ts-liveview dev')
log.enabled = true
const mode = process.argv[2]
if (mode != 'build' && mode != 'serve') {
  console.log('Please specify a mode: build or serve')
  process.exit(1)
}
main()
let stop = async () => {}
if (mode === 'serve') {
  process.stdin.on('data', async chunk => {
    if (chunk.toString().trim() == 'rs') {
      log('manual restarting...')
      await stop()
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
  await build(files)
  if (mode == 'build') {
    process.exit(0)
  }
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
  let plugins = []
  plugins.push({
    name: 'dev-server-watch',
    setup(build2) {
      let count = 0
      build2.onEnd(result => {
        count++
        log(`Finished build x${count}`)
        if (result.errors.length > 0) {
          log(result.errors)
        }
        postBuild()
      })
    },
  })
  let context = await esbuild.context({
    entryPoints: files,
    outdir: './dist',
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    plugins,
  })
  await context.rebuild()
  if (mode == 'serve') {
    await context.watch()
  }
  stop = () => context.dispose()
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
let restart_flag_file = path.join('dist', '__dev_restart__')
async function postBuild() {
  if (fs.existsSync(restart_flag_file)) {
    fs.unlinkSync(restart_flag_file)
    await stop()
    await main()
    return
  }
  await fix()
  if (mode == 'serve') {
    restartServer()
  }
}
async function fix() {
  let last_line = ''
  function update(new_line) {
    if (last_line) {
      process.stdout.write(
        '\r' + ' '.repeat(last_line.length) + '\r' + new_line,
      )
    } else {
      process.stdout.write(new_line)
    }
    last_line = new_line
  }
  let ps = []
  ps.push(fix_proxy({ update }))
  await Promise.all(ps)
  if (last_line) {
    update('')
    console.log()
  }
}
async function fix_proxy(context) {
  let file = path.join('dist', 'db', 'proxy.js')
  await wait_file(context, file)
  let text = fs.readFileSync(file).toString()
  if (!text.includes(`import { db } from "./db"`)) return
  text = text.replace(
    `import { db } from "./db"`,
    `import { db } from "./db.js"`,
  )
  fs.writeFileSync(file, text)
}
async function wait_file(context, file) {
  let wait_intervals = [10, 20, 50, 100, 200, 250, 500, 1e3]
  let default_interval = wait_intervals.pop()
  let start_time = Date.now()
  while (!fs.existsSync(file)) {
    let passed = Date.now() - start_time
    if (passed === 0) {
      context.update(`waiting file: ${file}`)
    } else {
      context.update(`waiting file: ${file} (for ${format_time(passed)})`)
    }
    let interval = wait_intervals.shift() || default_interval
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}
function format_time(time) {
  if (time < 1e3) {
    return time + 'ms'
  }
  if (time < 1e3 * 2) {
    return (time / 1e3).toFixed(1) + 's'
  }
  if (time < 1e3 * 60) {
    return (time / 1e3).toFixed(0) + 's'
  }
  if (time < 1e3 * 60 * 60) {
    return (time / 1e3 / 60).toFixed(1) + 'min'
  }
  return (time / 1e3 / 60 / 60).toFixed(1) + 'hr'
}
let stopServer = () => Promise.resolve()
let EPOCH = 0
async function restartServer() {
  await stopServer()
  log('starting server...')
  EPOCH++
  let server = child_process.spawn('node', ['dist/server/index.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EPOCH: String(EPOCH),
    },
  })
  let stopped = false
  let stopServerPromise = new Promise(resolve => {
    server.on('close', () => {
      stopped = true
      log('server stopped')
      resolve()
    })
  })
  stopServer = () => {
    if (stopped) {
      log('server already stopped')
    } else {
      log('stopping server...')
      server.kill()
    }
    return stopServerPromise
  }
  process.on('SIGINT', () => {
    server.kill('SIGINT')
  })
  process.on('SIGTERM', () => {
    server.kill('SIGTERM')
  })
  process.on('exit', () => {
    server.kill()
  })
}
