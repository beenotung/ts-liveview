import type { Request } from 'express'
import { Session } from './session'

export function logRequest(
  req: Request,
  method: string,
  url: string,
  session_id: string | null,
) {
  // TODO: log request into storage of your choice
}

export function updateRequestSession(session_id: string, session: Session) {
  // TODO: update request session into storage of your choice
}
