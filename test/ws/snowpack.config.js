// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/#configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    'client': '/'
  },
  plugins: [
    ['@snowpack/plugin-optimize',{}],
  ],
  // installOptions: {},
  // devOptions: {},
  buildOptions: {
    out: 'build',
  },
};
