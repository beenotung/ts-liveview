import { loadClientPlugin } from './client-plugin.js'

export let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

export let confettiPlugin = loadClientPlugin({
  entryFile: 'dist/client/confetti.js',
})

export let imagePlugin = loadClientPlugin({
  entryFile: 'dist/client/image.js',
})
