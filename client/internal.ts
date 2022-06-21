export type WindowStub = {
  emit(...args: unknown[]): void
  emitHref(event: Event, flag?: 'q'): void
  emitForm(event: Event): void
  get(url: string): Promise<Response>
  del(url: string): Promise<Response>
}
