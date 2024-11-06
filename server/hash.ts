import * as argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password)
}

export function comparePassword(options: {
  password: string
  password_hash: string
}): Promise<boolean> {
  return argon2.verify(options.password_hash, options.password)
}
