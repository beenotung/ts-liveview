#!/usr/bin/env node

import fs from 'fs'
import os from 'os'

function readReadme(file) {
  return fs.readFileSync(file).toString()
}

function parseGetStarted(projectName, lines) {
  let start = lines.findIndex(line => line.startsWith('## Get Started'))
  lines = lines.slice(start + 1)
  let end = lines.findIndex(line => line.startsWith('## '))
  lines = lines.slice(0, end)

  let message = ''

  let mode = 'scan'
  for (let line of lines) {
    if (line === 'To create a new project, run:') {
      line = 'Get started by typing:'
    }
    if (line.includes('npm init') || line.includes('npx create')) {
      continue
    }
    if (line.startsWith('```bash')) {
      mode = 'code'
      continue
    }
    if (line.startsWith('```')) {
      mode = 'scan'
      continue
    }
    if (mode === 'code') {
      line = '  ' + line
    }
    line = extractLink(line)
    message += line.replace(/my-app/g, projectName) + os.EOL
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

  return message
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
let projectName = 'demo-server'
let text = readReadme(file)
let lines = text.split('\n').map(lines => lines.replace('\r', ''))

console.log(parseCommands(lines))
console.log(parseGetStarted(projectName, lines))
console.log()
