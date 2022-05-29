import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('method'))) {
    await knex.schema.createTable('method', table => {
      table.increments('id')
      table.text('method').notNullable().unique()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('url'))) {
    await knex.schema.createTable('url', table => {
      table.increments('id')
      table.text('url').notNullable().unique()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('user_agent'))) {
    await knex.schema.createTable('user_agent', table => {
      table.increments('id')
      table.text('user_agent').notNullable().unique()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('request_log'))) {
    await knex.schema.createTable('request_log', table => {
      table.increments('id')
      table
        .integer('method_id')
        .unsigned()
        .notNullable()
        .references('method.id')
      table.integer('url_id').unsigned().notNullable().references('url.id')
      table
        .integer('user_agent_id')
        .unsigned()
        .nullable()
        .references('user_agent.id')
      table.integer('timestamp').notNullable()
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('request_log')
  await knex.schema.dropTableIfExists('user_agent')
  await knex.schema.dropTableIfExists('url')
  await knex.schema.dropTableIfExists('method')
}
