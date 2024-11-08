import Knex from 'knex'

/* eslint-disable @typescript-eslint/no-var-requires */
let configs = require('./knexfile')

export const knex = Knex(configs.development)
