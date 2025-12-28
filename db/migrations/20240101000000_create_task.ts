import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('task'))) {
    await knex.schema.createTable('task', table => {
      table.increments('id')
      table.text('title').notNullable()
      table.boolean('completed').notNullable().defaultTo(false)
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task')
}
