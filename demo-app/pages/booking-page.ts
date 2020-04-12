import { displayJSON } from '@beenotung/tslib/html'
import { DAY } from '@beenotung/tslib/time'
import { inputs, RadioOption, radios } from '../../src/helpers/h'
import { c, h } from '../lib'
import { State } from '../state'

export type Booking = {
  name: string
  tel: ''
  service: ''
  date: number
}

function getToday() {
  return new Date(new Date().toDateString()).getTime()
}

export function renderBookingPage(state: State) {
  const days: RadioOption[] = []
  const today = getToday()
  for (let i = 0; i < 9; i++) {
    const t = today + DAY * i
    const d = new Date(t)
    days.push({
      value: t.toString(),
      text: i === 0 ? 'Today' : i === 1 ? 'Tmr' : d.toDateString(),
    })
  }
  const booking = state.booking()
  const data = {
    ...booking,
    date: new Date(+booking.date).toDateString(),
  }
  return c(
    '#booking',
    h`<div id="booking">
<h2>Booking Service</h2>
<div style="border: 1px solid orangered">
${displayJSON(data)}
</div>
${inputs([
  {
    label: 'Contact Person',
    input: `<input type="text" onchange="send('booking','name',event.target.value)">`,
  },
  {
    label: 'Contact Tel',
    input: `<input type="tel" onchange="send('booking','tel',event.target.value)">`,
  },
  {
    label: 'Service',
    input: `<select onchange="send('booking','service',event.target.value)">
<option value="service_a">Service A</option>
<option value="service_b">Service B</option>
<option value="service_c">Service C</option>
</select>`,
  },
  {
    label: 'Date',
    input: radios({
      id: 'date',
      options: days,
      onchange: `send('booking','date',event.target.value)`,
    }),
  },
  {
    label: '',
    input: `<input type="button" value="Submit" onclick="send('submit')">`,
  },
])}
</div>`,
  )
}
