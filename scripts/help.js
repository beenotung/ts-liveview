#!/usr/bin/env node

import fs from 'fs'
import os from 'os'

function readReadme(file) {
  return fs.readFileSync(file).toString()
}

function findLineIndex(lines, predicate, offset = 0) {
  for (let i = offset; i < lines.length; i++) {
    if (predicate(lines[i])) {
      return i
    }
  }
  return -1
}

function getStarted() {
  let message = ''

  message += 'Get started by typing:' + os.EOL
  message += os.EOL
  message += '  ./scripts/init.sh' + os.EOL
  message += '  npm start' + os.EOL

  return message.trim()
}

function parseGuides(lines) {
  let start = findLineIndex(lines, line => line.startsWith('## Get Started'))
  if (start === -1) return ''
  start = findLineIndex(lines, line => line === '```', start)
  if (start === -1) return ''
  start++
  let end = findLineIndex(lines, line => line.startsWith('## '), start)
  if (end === -1) return ''

  let message = ''

  for (let i = start; i < end; i++) {
    let line = lines[i]
    line = extractLink(line)
    message += line + os.EOL
  }

  return message.trim()
}

let commandRegex = /`(.*?)`:/
function parseCommands(lines) {
  let start = lines.findIndex(line =>
    line.startsWith('## Available npm scripts'),
  )
  lines = lines.slice(start + 1)
  let end = lines.findIndex(line => line.startsWith('## '))
  lines = lines.slice(0, end)

  let message = ''

  message += 'Available npm scripts:' + os.EOL

  for (let line of lines) {
    if (line.startsWith('`')) {
      line = '  ' + line.match(commandRegex)[1]
    } else if (line != '') {
      line = '    ' + line
    }
    message += line + os.EOL
  }

  return message.trim()
}

let lineRegex = /\[.*?\]\((.*)\)/
function extractLink(line) {
  let match = line.match(lineRegex)
  if (match) {
    line = line.replace(match[0], match[1])
  }
  return line
}

let file = 'README.md'
let text = readReadme(file)
let lines = text.split('\n').map(lines => lines.replace('\r', ''))

process.stdout.write(getStarted() + os.EOL)
process.stdout.write(os.EOL + os.EOL)
process.stdout.write(parseGuides(lines) + os.EOL)
process.stdout.write(os.EOL + os.EOL)
process.stdout.write(parseCommands(lines) + os.EOL)
