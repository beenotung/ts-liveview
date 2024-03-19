import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('verification_code', table => {
    table.index(['passcode'])
    table.index(['request_time'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('verification_code', table => {
    table.dropIndex(['passcode'])
    table.dropIndex(['request_time'])
  })
}
