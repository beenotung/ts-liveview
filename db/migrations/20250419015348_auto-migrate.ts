import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('content_report', table => {
    table.renameColumn('code', 'type')
  })
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('content_report', table => {
    table.renameColumn('type', 'code')
  })
}
