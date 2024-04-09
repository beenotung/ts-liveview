import { DBInstance, newDB } from 'better-sqlite3-schema'
import { existsSync } from 'fs'
import { join } from 'path'

function getDataDir(): string {
  let dir = 'data'
  if (!existsSync(dir)) dir = join('..', dir)
  if (existsSync(dir)) return dir
  throw new Error('Could not find data directory')
}

export let dataDir = getDataDir()

export let dbFile = join(dataDir, 'db.sqlite3')

export let db: DBInstance = newDB({
  path: dbFile,
  migrate: false,
  fileMustExist: true,
  WAL: true,
  synchronous: 'NORMAL',
})
