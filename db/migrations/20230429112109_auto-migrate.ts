import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('ua_type'))) {
    await knex.schema.createTable('ua_type', table => {
      table.increments('id')
      table.text('name').notNullable().unique()
      table.integer('count').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('ua_bot'))) {
    await knex.schema.createTable('ua_bot', table => {
      table.increments('id')
      table.text('name').notNullable().unique()
      table.integer('count').notNullable()
      table.timestamps(false, true)
    })
  }
  await knex.raw(
    'alter table `user_agent` add column `ua_type_id` integer null references `ua_type`(`id`)',
  )
  await knex.raw(
    'alter table `user_agent` add column `ua_bot_id` integer null references `ua_bot`(`id`)',
  )

  if (!(await knex.schema.hasTable('ua_stat'))) {
    await knex.schema.createTable('ua_stat', table => {
      table.increments('id')
      table.integer('last_request_log_id').notNullable()
      table.timestamps(false, true)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ua_stat')
  await knex.raw('alter table `user_agent` drop column `ua_bot_id`')
  await knex.raw('alter table `user_agent` drop column `ua_type_id`')
  await knex.schema.dropTableIfExists('ua_bot')
  await knex.schema.dropTableIfExists('ua_type')
}
