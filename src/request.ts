import { Request } from './types/server'
import http from 'http'

export type CommonRequest = {
  query: Record<string, any> & {
    hash?: string
    _primuscb?: string
  }
  http?: Request
  primus?: http.ClientRequest
}
