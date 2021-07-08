import { randomBytes } from 'crypto'

const LOOP_BATCH = 5000
const BIT_LENGTH = 258

export function loop(resolve: (token: string) => void) {
  for (let i = 0; i < LOOP_BATCH; i++) {
    const token = randomBytes(BIT_LENGTH).toString('base64')
    if (token.includes('/') || token.includes('+')) {
      continue
    }
    resolve(token)
    return
  }
  setTimeout(loop, 0, resolve)
}

export function genToken() {
  return new Promise<string>(loop)
}

export function genTokenSync(): string {
  for (;;) {
    const token = randomBytes(BIT_LENGTH).toString('base64')
    if (token.includes('/') || token.includes('+')) {
      continue
    }
    return token
  }
}
