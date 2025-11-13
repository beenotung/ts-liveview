import { spawn } from 'child_process'
import { writeFileSync } from 'fs'
import { scan_host } from 'listening-on'

export function setCaddy(upstream_port: number) {
  // setup caddy config file
  let upstream = `127.0.0.1:${upstream_port}`
  let http_port = 8080
  let https_port = 8443
  let code = `
{
	http_port ${http_port}
	https_port ${https_port}
}
`

  function addHost(host: string) {
    code += `
${host}:${https_port} {
	encode gzip zstd
	reverse_proxy ${upstream}
	tls internal
}
`
  }

  scan_host({
    onAddress(address) {
      if (address.host === '127.0.0.1') return
      addHost(address.host)
      console.log(`listening on https://${address.host}:${https_port}`)
    },
  })

  writeFileSync('Caddyfile', code)

  // run caddy proxy
  let child = spawn('caddy', ['run', '--config', 'Caddyfile'])
  child.on('close', code => {
    if (code !== 0) {
      console.error(`Caddy process exited with code ${code}`)
    }
  })
  child.on('error', error => {
    console.error(`Caddy process error: ${error}`)
  })

  return child
}
