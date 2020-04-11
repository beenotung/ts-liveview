import { EventEmitter } from 'events'
import S from 's-js'
import { getHash } from './helpers/location'
import { Booking } from './pages/booking-page'

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

  constructor(public init: { url: string }) {}

  dispose() {
    clearTimeout(this.timer)
    this.events.removeAllListeners()
  }
}
