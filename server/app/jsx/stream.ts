import express from 'express'
import { html } from './types'
import type from 'compression'

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
