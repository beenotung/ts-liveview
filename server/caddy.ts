import { spawn } from 'child_process'
import { writeFileSync } from 'fs'
import { scan_host } from 'listening-on'

/**
 * Automatically sets up and runs a Caddy HTTPS reverse proxy for development.
 *
 * This is useful for testing features that require HTTPS (e.g., camera, microphone access)
 * on mobile devices or remote network access during development.
 * Note: Localhost doesn't need HTTPS - browsers allow camera/mic on localhost over HTTP.
 *
 * The function:
 * - Auto-generates a Caddyfile with all network interfaces (excluding localhost)
 * - Creates self-signed certificates using Caddy's internal CA
 * - Proxies HTTPS requests (port 8443) to the Node.js server (upstream_port)
 */
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
    family: 'IPv4',
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
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error('Error: Caddy command not found')
      console.error('You can install it with: ./scripts/caddy-install.sh')
      console.error('Made sure it is added to the PATH environment variable')
    } else {
      console.error(`Caddy process error:`, error)
    }
  })

  return child
}
