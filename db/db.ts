import { toSafeMode, newDB } from 'better-sqlite3-schema'
import { join } from 'path'

export let dbFile = join('data', 'dev.sqlite3')

export let db = newDB({
  path: dbFile,
  migrate: false,
  fileMustExist: true,
})

toSafeMode(db)
