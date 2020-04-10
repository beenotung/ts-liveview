import { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { ServerResponse, IncomingMessage } from 'http'

export { Server } from 'http'

export { IncomingMessage } from 'http'

export type Request = ExpressRequest & IncomingMessage
export type Response = ExpressResponse & ServerResponse
