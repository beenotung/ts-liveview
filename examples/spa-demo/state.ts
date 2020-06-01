import { EventEmitter } from 'events'
import S from 's-js'
import { getHash } from './helpers/location'
import { initCalculator } from './pages/calculator-page'
import { Booking } from './pages/form-page'
import { dec_counter, inc_counter, live_session_counter } from './state/visitor'

export * from './state/visitor'

export class State {
  events = new EventEmitter()

  // for Clock
  clock = S.data(Date.now())
  timer = setInterval(() => this.clock(Date.now()), 1000)

  // for Nav
  hash = S.data(getHash(this.init.url))

  // for Home Page
  width = S.data(150)
  background = S.data('white')

  // for Booking Page
  booking = S.data<Booking>({
    name: '',
    tel: '',
    service: '',
    date: Date.now(),
  })

  // for Calculator Page
  calculator = initCalculator()

  constructor(public init: { url: string }) {
    inc_counter(live_session_counter)
  }

  dispose() {
    clearTimeout(this.timer)
    this.events.removeAllListeners()
    dec_counter(live_session_counter)
  }
}
