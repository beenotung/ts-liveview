import fs from 'fs'
import path from 'path'
import debug from 'debug'

let entryFile = process.argv[2]

if (!entryFile) {
  console.error('missing entryFile in argument')
  process.exit(1)
}
if (!fs.existsSync(entryFile)) {
  let name = JSON.stringify(entryFile)
  console.error(`entryFile ${name} does not exist`)
  process.exit(1)
}

let log = debug('fix-esm-import-path')
log.enabled = true

function findNodeModuleDir(dir, name) {
  for (;;) {
    let files = fs.readdirSync(dir)
    if (files.includes('node_modules')) {
      let libDir = path.join(dir, 'node_modules', name)
      if (fs.existsSync(libDir)) {
        return libDir
      }
    }
    let parentFile = path.join(dir, '..')
    let parentDir = path.dirname(path.resolve(parentFile))
    if (parentDir == '/') {
      return null
    }
    dir = parentFile
  }
}

function getModuleEntryFile(dir) {
  let files = fs.readdirSync(dir)
  let entryFile = 'index.js'
  if (files.includes('package.json')) {
    let text = fs.readFileSync(path.join(dir, 'package.json')).toString()
    let pkg = JSON.parse(text)
    entryFile = pkg.module || pkg.main || entryFile
  }
  return path.join(dir, entryFile)
}

function scanModule({ name, srcFile }) {
  let numOfDir = name.split('/').length - 1
  if (name.includes('@')) {
    numOfDir--
  }
  if (numOfDir === 0) {
    return
  }
  log('scanModule:', name)
  let dir = findNodeModuleDir(path.dirname(srcFile), name)
  log('dir:', dir)
  let mainFile = getModuleEntryFile(dir)
  log('module entry file:', mainFile)
  console.error('TODO')
  process.exit(1)
}

function scanLibFile(args) {
  let { srcFile, importCode, name, file } = args
  log('scanLibFile:', { srcFile, importCode, file })
  if (isFileExists(file)) {
    return scanFile(args)
  }
  for (let indexFile of ['index.js', 'index.ts', 'index.tsx']) {
    indexFile = path.join(file, indexFile)
    if (isFileExists(indexFile)) {
      return scanFile({
        ...args,
        srcFile: file,
        file: indexFile,
      })
    }
  }
  if (file.endsWith('.js')) {
    for (let ext of ['.ts', '.tsx']) {
      let tsFile = file.replace(/\.js$/, ext)
      if (isFileExists(tsFile)) {
        return scanFile({
          ...args,
          srcFile: file,
          file: tsFile,
        })
      }
    }
  }
  let jsFile = name + '.js'
  log('check jsFile:', jsFile)
  if (isFileExists(jsFile)) {
    log(`fix ${srcFile} import: ${name} -> ${name}.js`)
    let fromCode = importCode
    let toCode = importCode.replace(name, name + '.js')
    return args.code.replace(fromCode, toCode)
  }
  console.error('[scanLibFile] Error: file not found.', {
    srcFile,
    importCode,
    name,
    file,
  })
  process.exit(1)
}

function scanLib(args) {
  let { srcFile, name } = args
  if (name[0] === '/') {
    // absolute path
    return scanLibFile(args)
  }
  if (name[0] === '.') {
    // relative path
    let dir = path.dirname(srcFile)
    args.file = path.join(dir, name)
    log('relative path:', { srcFile, dir, name, file: args.file })
    return scanLibFile(args)
  }
  // npm module
  return scanModule(args)
}

function isFileExists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile()
}

function scanFile({ file, srcFile }) {
  log('scanFile:', file)
  let code = fs.readFileSync(file).toString()
  let originalCode = code
  for (let regex of [
    /.*import .* from '(.*)'.*/g,
    /.*import .* from "(.*)".*/g,
  ]) {
    for (let match of code.matchAll(regex)) {
      let [importCode, name] = match
      if (importCode.includes('import type')) continue
      code = scanLib({ srcFile, importCode, name, file, code }) || code
    }
  }
  if (code != originalCode) {
    log(`[scanFile] update file:`, file)
    fs.writeFileSync(file, code)
  }
}
scanFile({ file: entryFile, srcFile: entryFile })
