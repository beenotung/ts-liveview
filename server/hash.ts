import { compare, hash, hashSync } from 'bcrypt'

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

export async function hashPassword(password: string): Promise<string> {
  let cost = calcCost(password)
  return hash(password, cost)
}

export function comparePassword(options: {
  password: string
  password_hash: string
}): Promise<boolean> {
  return compare(options.password, options.password_hash)
}
