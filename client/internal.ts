import type { ServerMessage } from './types'

export type WindowStub = {
  emit(...args: unknown[]): void
  goto(url: string): void
  emitHref(event: Event, flag?: LinkFlag): void
  emitForm(event: Event): void
  submitForm(form: HTMLFormElement): void
  onServerMessage(message: ServerMessage): void
  get(url: string): Promise<Response>
  del(url: string): Promise<Response>
  uploadForm(event: Event): Promise<Response>
  upload(url: string, formData: FormData): Promise<Response>
  remount(): void
  fetch_json(input: RequestInfo | URL, init?: RequestInit): Promise<any>
  showError(error: unknown): void
  _navigation_type_: 'static' | 'express' | 'ws'
  _navigation_method_: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  ws_status?: HTMLElement
}

export type LinkFlag = ['q', 'f', 'b']
