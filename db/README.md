## Updating database schema (migration)

Remark: cd to `db` if not done already

Auto mode:

1. update `erd.txt` with any text editor
2. run `npm run update`

Manual mode:

1. update `erd.txt` with any text editor
2. run `npm run gen-migrate`
3. review the generated migration script in the `migrations` directory
4. run `npm run migrate`
5. run `npm run gen-proxy`

## Populating database (seeding)

You can setup configuration data and sample data in `seed.ts`, then run it with `npm run seed`.

## Why a separate package?

This package is used to isolate knex from top-level package.

We're using esm on the top-level package but knex with typescript only works in commonjs package.

The files here are compiled and imported from the server directly, so the dependencies of this package should appear on the top-level package.json as well.
