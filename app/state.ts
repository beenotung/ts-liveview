import { EventEmitter } from 'events'
import S from 's-js'
import { getHash } from './helpers/location'
import { Booking } from './pages/booking-page'

export class State {
  events = new EventEmitter()

  clock = S.data(Date.now())
  timer = setInterval(() => this.clock(Date.now()), 1000)

  hash = S.data(getHash(this.init.url))

  booking = S.data<Booking>({
    name: '',
    tel: '',
    service: '',
    date: Date.now(),
  })

  constructor(public init: { url: string }) {}

  dispose() {
    clearTimeout(this.timer)
    this.events.removeAllListeners()
  }
}
