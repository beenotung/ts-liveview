import Knex from 'knex'
import { dbFile } from './db.js'

let knex = Knex({
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: dbFile,
  },
})

async function main() {
  let args = process.argv.slice(2)
  if (args.length == 0) {
    console.error('Error: missing knex command in argument')
    return
  }
  type MigrationResult = [batch: number, migrations: string[]]
  function showMigrationResult(
    label: string,
    [batch, migrations]: MigrationResult,
  ) {
    if (migrations.length === 0) {
      console.log('No migrations affected.')
      return
    }
    console.log(label, 'batch:', batch)
    console.log('migrations:')
    console.log(migrations.map(s => '- ' + s).join('\n'))
  }
  switch (args[0]) {
    case 'migrate:up': {
      showMigrationResult('migrate:up', await knex.migrate.up())
      break
    }
    case 'migrate:down': {
      showMigrationResult('migrate:down', await knex.migrate.down())
      break
    }
    case 'migrate:latest': {
      showMigrationResult('migrate:latest', await knex.migrate.latest())
      break
    }
    case 'migrate:rollback': {
      let config = undefined
      let all = args[1] === '--all'
      showMigrationResult('rollback', await knex.migrate.rollback(config, all))
      break
    }
    case 'migrate:status': {
      type Result = [{ name: string }[], { file: string }[]]
      let [done, pending] = (await knex.migrate.list()) as Result

      console.log(done.length, 'applied migrations')
      for (let each of done) {
        console.log('- ' + each.name)
      }

      console.log(pending.length, 'pending migrations')
      for (let each of pending) {
        console.log('- ' + each.file)
      }
      break
    }
    default: {
      console.error('Error: unknown arguments:', args)
    }
  }
}
main()
  .catch(e => console.error(e))
  .then(() => knex.destroy())
