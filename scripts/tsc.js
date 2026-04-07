#!/usr/bin/env node

'use strict'
import child_process from 'child_process'

// ignore file list in the arguments from lint-staged
try {
  child_process.execSync('npx tsc -p . --noEmit', {
    stdio: 'inherit',
  })
} catch (error) {
  process.exit(1)
}
