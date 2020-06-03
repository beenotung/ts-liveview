import http from 'http'
import { Request } from './types/server'

export type CommonRequest = {
  query: Record<string, any> & {
    hash?: string
    _primuscb?: string
  }
  http?: Request
  primus?: http.ClientRequest
}
