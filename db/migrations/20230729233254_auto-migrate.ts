import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `user` add column `avatar` varchar(256) null')
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw('alter table `user` drop column `avatar`')
}
