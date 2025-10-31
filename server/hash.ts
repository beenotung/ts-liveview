import { compare, hash, hashSync } from 'bcrypt'
import { createHash } from 'crypto'

// reference: https://stackoverflow.com/a/61304956/3156509
function calcCost(password: string) {
  const InitialCost = 6
  const TargetTime = 250
  const MinCost = 10
  const MaxCost = 31

  let cost = InitialCost
  let start = Date.now()
  hashSync(password, cost)
  let end = Date.now()
  let time = end - start
  while (time < TargetTime) {
    cost += 1
    time *= 2
  }

  return cost < MinCost ? MinCost : cost > MaxCost ? MaxCost : cost
}

const max_bcrypt_input_length = 72

function preprocessPassword(password: string): string {
  let byte_length = Buffer.from(password).length
  if (byte_length <= max_bcrypt_input_length) {
    return password
  }
  let hash = createHash('sha256')
  hash.write(password)
  return hash.digest('hex')
}

export async function hashPassword(password: string): Promise<string> {
  password = preprocessPassword(password)
  let cost = calcCost(password)
  return hash(password, cost)
}

export function comparePassword(options: {
  password: string
  password_hash: string
}): Promise<boolean> {
  let password = preprocessPassword(options.password)
  return compare(password, options.password_hash)
}
