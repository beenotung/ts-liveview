// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    'client': '/client',
  },
  plugins: [
    ['@snowpack/plugin-optimize', { /* options */ }],
    // ['@snowpack/plugin-typescript', { args: '-p .' }],
  ],
  // installOptions: {},
  // devOptions: {},
  buildOptions: {
    'out': 'build',
  },
}
