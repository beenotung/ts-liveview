import express, { type Response } from 'express'
import type { html } from './types'
import { EarlyTerminate } from '../../exception.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Response {
      /**
       * for streaming html response
       */
      flush(): void
    }
  }
}

if (!express.response.flush) {
  express.response.flush = noop
}

export interface HTMLStream {
  write(chunk: html): void
  flush(): void
}

export function noop() {
  /* placeholder for flush() */
}

export function isWriteAfterEndError(error: unknown) {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ERR_STREAM_WRITE_AFTER_END'
  )
}

export function expressResponseStream(res: Response): HTMLStream {
  return {
    write(chunk: html) {
      if (res.writableEnded || res.destroyed) {
        throw EarlyTerminate
      }
      try {
        res.write(chunk)
      } catch (error) {
        if (isWriteAfterEndError(error) || res.writableEnded || res.destroyed) {
          throw EarlyTerminate
        }
        throw error
      }
    },
    flush() {
      res.flush()
    },
  }
}

export function safeResEnd(res: Response, chunk?: string) {
  if (res.writableEnded || res.destroyed) {
    return
  }
  if (chunk !== undefined) {
    // deepcode ignore XSS: the dynamic content is html-escaped
    res.end(chunk)
  } else {
    res.end()
  }
}
