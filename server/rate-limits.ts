import { SECOND, MINUTE, HOUR } from '@beenotung/tslib/time.js'
import { createRateLimit } from './rate-limit.js'

// GET requests - generous for page views and image loading
export let get_rate_limit = createRateLimit({
  ip: { capacity: 100, interval: SECOND / 2 },
  user: { capacity: 200, interval: SECOND / 2 },
})

// General API - user gets more generous limits
export let api_rate_limit = createRateLimit({
  ip: { capacity: 30, interval: 1 * SECOND },
  user: { capacity: 60, interval: 1 * SECOND },
})

// Email - moderate capacity, cooldown on target
export let email_rate_limit = createRateLimit({
  ip: { capacity: 8, interval: 3 * MINUTE },
  target: { capacity: 3, interval: 10 * MINUTE, cooldown: 30 * SECOND },
  global: { capacity: 100, interval: SECOND / 2 },
})

// SMS - low capacity, long interval, cooldown on target
export let sms_rate_limit = createRateLimit({
  ip: { capacity: 5, interval: 5 * MINUTE },
  target: { capacity: 3, interval: 10 * MINUTE, cooldown: 30 * SECOND },
  global: { capacity: 50, interval: 1 * SECOND },
})

// Password login - protect against brute force (not needed for OTP-only auth)
export let password_rate_limit = createRateLimit({
  ip: { capacity: 10, interval: 2 * MINUTE },
  target: { capacity: 5, interval: 5 * MINUTE, cooldown: 5 * SECOND },
  global: { capacity: 100, interval: 1 * SECOND },
})

// Register - prevent spam on specific email
export let register_rate_limit = createRateLimit({
  ip: { capacity: 5, interval: 10 * MINUTE },
  target: { capacity: 3, interval: 15 * MINUTE },
  global: { capacity: 50, interval: 1 * SECOND },
})

let limits = [
  get_rate_limit,
  api_rate_limit,
  email_rate_limit,
  sms_rate_limit,
  password_rate_limit,
  register_rate_limit,
]

function auto_prune() {
  for (let limit of limits) {
    limit.prune()
  }
}

setInterval(auto_prune, 1 * HOUR)
