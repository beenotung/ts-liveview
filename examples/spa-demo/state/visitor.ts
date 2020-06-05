import S, { DataSignal } from 's-js'
import { makeCounter } from './counter'

export let visitor_counter = makeCounter('visitor')
export let session_counter = makeCounter('session')
export let live_session_counter = S.data(0)

export function inc_counter(counter: DataSignal<number>) {
  const acc = S.sample(counter)
  counter(acc + 1)
}

export function dec_counter(counter: DataSignal<number>) {
  const acc = S.sample(counter)
  counter(Math.max(0, acc - 1))
}
