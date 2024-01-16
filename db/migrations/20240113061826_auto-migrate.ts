import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('request_session'))) {
    await knex.schema.createTable('request_session', table => {
      table.increments('id')
      table.text('language').nullable()
      table.text('timezone').nullable()
      table.integer('timezone_offset').nullable()
      table.timestamps(false, true)
    })
  }
  await knex.raw(
    'alter table `request_log` add column `request_session_id` integer null references `request_session`(`id`)',
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `request_log` drop column `request_session_id`')
  await knex.schema.dropTableIfExists('request_session')
}
