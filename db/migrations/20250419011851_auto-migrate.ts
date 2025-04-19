import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('content_report'))) {
    await knex.schema.createTable('content_report', table => {
      table.increments('id')
      table.integer('reporter_id').unsigned().nullable().references('user.id')
      table.text('code').notNullable()
      table.text('remark').nullable()
      table.integer('submit_time').notNullable()
      table.integer('reviewer_id').unsigned().nullable().references('user.id')
      table.integer('review_time').nullable()
      table.integer('accept_time').nullable()
      table.integer('reject_time').nullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('content_report')
}
