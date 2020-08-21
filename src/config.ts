import { ServerOptions } from './server'

export function getClientScriptName(option: ServerOptions) {
  return option.client_script_name || '/liveview.js'
}
