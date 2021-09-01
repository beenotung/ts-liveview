// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
    splitting: false,
    treeshake: true,
    sourcemap: 'external',
    entrypoints: ['dist/client/index.js'],
  },
  mount: {
    'dist/client': '/',
    'public': '/',
  },
  plugins: [
    /* ... */
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
}
