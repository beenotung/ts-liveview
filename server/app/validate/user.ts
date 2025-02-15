import { find } from 'better-sqlite3-proxy'
import { proxy, User } from '../../../db/proxy.js'
import { config } from '../../config.js'
import { ValidateResult } from '../components/field.js'

export type ValidateUserResult =
  | ValidateResult
  | {
      type: 'found'
      text: string
      user: User
      extra?: string
    }

let minUsername = 1
let maxUsername = 32

let siteName = config.site_name.toLowerCase()

export function validateUsername(username: string): ValidateUserResult {
  if (!username) {
    return { type: 'error', text: 'username not provided' }
  }

  if (username.length < minUsername) {
    let diff = minUsername - username.length
    return {
      type: 'error' as const,
      text: `username "${username}" is too short, need ${diff} more characters`,
    }
  }

  if (username.length > maxUsername) {
    let diff = username.length - maxUsername
    return {
      type: 'error' as const,
      text: `username "${username}" is too long, need ${diff} less characters`,
    }
  }

  if (username.replace(/badminton/g, '').includes('admin')) {
    return {
      type: 'error' as const,
      text: `username cannot contains "admin"`,
    }
  }

  if (username.includes(siteName)) {
    return {
      type: 'error' as const,
      text: `username cannot contains "${siteName}"`,
    }
  }

  let excludedChars = Array.from(
    new Set(username.replace(/[a-z0-9_]/g, '')),
  ).join('')
  if (excludedChars.length > 0) {
    return {
      type: 'error' as const,
      text: `username cannot contains "${excludedChars}"`,
      extra: `username should only consist of english letters [a-z] and digits [0-9], underscore [_] is also allowed`,
    }
  }

  let user = find(proxy.user, { username })
  if (user) {
    return {
      type: 'found' as const,
      text: `username "${username}" is already used`,
      user,
    }
  }

  return {
    type: 'ok' as const,
    text: `username "${username}" is available`,
  }
}

let minNickname = 1
let maxNickname = 50

export function validateNickname(nickname: string): ValidateUserResult {
  if (!nickname) {
    return { type: 'error', text: 'nickname not provided' }
  }

  if (nickname.length < minNickname) {
    let diff = minNickname - nickname.length
    return {
      type: 'error' as const,
      text: `nickname "${nickname}" is too short, need ${diff} more characters`,
    }
  }

  if (nickname.length > maxNickname) {
    let diff = nickname.length - maxNickname
    return {
      type: 'error' as const,
      text: `nickname "${nickname}" is too long, need ${diff} less characters`,
    }
  }

  if (
    nickname
      .toLowerCase()
      .replace(/badminton/g, '')
      .includes('admin')
  ) {
    return {
      type: 'error' as const,
      text: `nickname cannot contains "admin"`,
    }
  }

  if (nickname.toLowerCase().includes(siteName)) {
    return {
      type: 'error' as const,
      text: `nickname cannot contains "${siteName}"`,
    }
  }

  return {
    type: 'ok' as const,
    text: `nickname "${nickname}" is available`,
  }
}
