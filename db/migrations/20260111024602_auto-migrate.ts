import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('error_log'))) {
    await knex.schema.createTable('error_log', table => {
      table.increments('id')
      table.integer('timestamp').notNullable()
      table.text('title').notNullable()
      table.text('error').notNullable()
      table.integer('client_url_id').unsigned().notNullable().references('url.id')
      table.integer('api_url_id').unsigned().notNullable().references('url.id')
      table.integer('request_log_id').unsigned().notNullable().references('request_log.id')
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('error_log')
}
