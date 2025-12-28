import { Knex } from 'knex'

export async function dropIndexIfExists(
  knex: Knex,
  table: string,
  index: string,
) {
  try {
    await knex.schema.alterTable(table, table => {
      table.dropIndex([index])
    })
  } catch (error) {
    if (String(error).includes('no such index')) {
      // index already dropped
    } else {
      throw error
    }
  }
}
