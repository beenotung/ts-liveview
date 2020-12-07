import { clientScriptCode } from './helpers/client-adaptor'
import { ServerOptions } from './server'

export function getClientScriptName(option: ServerOptions) {
  return option.client_script_name || '/liveview.js'
}

export async function getClientScript(options: ServerOptions) {
  return options.client_script || clientScriptCode
}
