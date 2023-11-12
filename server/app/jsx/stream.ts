import express from 'express'
import type { html } from './types'

declare global {
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
