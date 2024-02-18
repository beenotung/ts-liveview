import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  {
    const rows = await knex.select('id', 'username').from('user')
    await knex.schema.alterTable('user', table =>
      table.dropUnique(['username']),
    )
    await knex.raw('alter table `user` drop column `username`')
    await knex.raw('alter table `user` add column `username` varchar(32) null')
    await knex.schema.alterTable('user', table => table.unique(['username']))
    for (let row of rows) {
      await knex('user')
        .update({ username: row.username })
        .where({ id: row.id })
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  {
    await knex.raw('delete from `user` where `username` is null')
    const rows = await knex.select('id', 'username').from('user')
    await knex.schema.alterTable('user', table =>
      table.dropUnique(['username']),
    )
    await knex.raw('alter table `user` drop column `username`')
    await knex.raw('alter table `user` add column `username` text not null')
    await knex.schema.alterTable('user', table => table.unique(['username']))
    for (let row of rows) {
      await knex('user')
        .update({ username: row.username })
        .where({ id: row.id })
    }
  }
}
