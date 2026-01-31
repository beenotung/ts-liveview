import { TokenBucket, TokenBucketOptions } from 'token-bucket.ts'
import { HttpError } from './exception.js'
import type { Context } from './app/context'
import { getContextCookies } from './app/cookie.js'
import { getRequestIP } from './app/ip.js'

// only check ip if user_id is not provided
export type RateLimitOptions = {
  // for visitor that has not login
  ip?: TokenBucketOptions
  // for user limited resources
  user?: TokenBucketOptions
  // e.g. for email, phone number verification code
  target?: TokenBucketOptions
  // e.g. external API call
  global?: TokenBucketOptions
}

export type RateLimitContext = {
  ip?: string | null
  user_id?: number | null
  target?: string | number | null
}

export type RateLimitType = 'ip' | 'user' | 'target' | 'global'

export type RateLimitResult = {
  wait_time: number
  type: RateLimitType | null
}

export class RateLimitError extends HttpError {
  wait_time: number
  type: RateLimitType

  constructor(result: RateLimitResult) {
    super(429, `Rate limit exceeded (${result.type})`)
    this.wait_time = result.wait_time
    this.type = result.type!
  }
}

const GLOBAL_KEY = 'global'

export function createRateLimit(options: RateLimitOptions) {
  let ip = options.ip ? new TokenBucket(options.ip) : null
  let user = options.user ? new TokenBucket(options.user) : null
  let target = options.target ? new TokenBucket(options.target) : null
  let global = options.global ? new TokenBucket(options.global) : null

  let limits = [ip, user, target, global]

  function check(context: RateLimitContext): RateLimitResult {
    let ip_wait_time =
      // skip ip check if user is provided
      user && context.user_id
        ? 0
        : ip && context.ip
          ? ip.check(context.ip).wait_time
          : 0
    let user_wait_time =
      user && context.user_id ? user.check(context.user_id).wait_time : 0
    let target_wait_time =
      target && context.target ? target.check(context.target).wait_time : 0
    let global_wait_time = global ? global.check(GLOBAL_KEY).wait_time : 0
    let wait_time = Math.max(
      ip_wait_time,
      user_wait_time,
      target_wait_time,
      global_wait_time,
    )

    if (wait_time == 0) {
      return { wait_time: 0, type: null }
    }

    if (wait_time === ip_wait_time) {
      return { wait_time, type: 'ip' }
    }
    if (wait_time === user_wait_time) {
      return { wait_time, type: 'user' }
    }
    if (wait_time === target_wait_time) {
      return { wait_time, type: 'target' }
    }
    if (wait_time === global_wait_time) {
      return { wait_time, type: 'global' }
    }

    throw new Error('Assertion failed, no wait time found')
  }

  function consume(context: RateLimitContext): RateLimitResult {
    let result = check(context)
    if (result.wait_time > 0) {
      throw new RateLimitError(result)
    }
    // only consume ip if user is not provided
    if (ip && context.ip && !(user && context.user_id)) {
      ip.consume(context.ip)
    }
    if (user && context.user_id) {
      user.consume(context.user_id)
    }
    if (target && context.target) {
      target.consume(context.target)
    }
    if (global) {
      global.consume(GLOBAL_KEY)
    }
    return result
  }

  function prune(): void {
    for (let limit of limits) {
      if (limit && limit.initial >= limit.capacity) {
        limit.prune()
      }
    }
  }

  return {
    check,
    consume,
    prune,
  }
}

/**
 * Extract IP and user_id from request context for rate limiting.
 * Returns RateLimitContext that can be passed to rate limiter's check/consume methods.
 */
export function getRateLimitContext(
  context: Context,
  target?: string | number | null,
): RateLimitContext {
  if (context.type === 'static') {
    throw new Error('Cannot get rate limit context from static context')
  }

  let req = context.type === 'express' ? context.req : context.ws.request
  let ip = getRequestIP(req)

  let cookies = getContextCookies(context)
  let user_id_str = cookies?.signedCookies.user_id
  let user_id = user_id_str ? +user_id_str : null

  return { ip, user_id, target }
}
