import jwt from 'jwt-simple'
import { config } from '../config.js'

export type JwtPayload = {
  id: number
}

export function encodeJwt(payload: JwtPayload): string {
  return jwt.encode(payload, config.cookie_secret)
}

export function decodeJwt(token: string): JwtPayload {
  return jwt.decode(token, config.cookie_secret)
}
