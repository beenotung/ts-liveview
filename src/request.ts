import { ISpark } from 'typestub-primus'
import { Request } from './types/server'

export type CommonRequest = {
  http?: Request
  spark?: ISpark
}
