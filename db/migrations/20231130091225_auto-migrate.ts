import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user', table => {
    table.unique(['username'])
    table.unique(['email'])
    table.unique(['tel'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('user', table => {
    table.dropUnique(['tel'])
    table.dropUnique(['email'])
    table.dropUnique(['username'])
  })
}
