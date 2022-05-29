This package is used to isolate knex from top-level context.

We're using esm on the top-level but knex with typescript only works in commonjs package.

The files here are compiled and imported from the server directly, so the dependencies of this package should appear on the top-level package.json as well.
