import express from 'express'
import type { html } from './types'
import type {} from 'compression' // for express.response.flush()

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
