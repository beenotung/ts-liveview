import { ViewContext } from 'ts-liveview'
import { ISpark } from 'typestub-primus'

export class State {
  constructor(public spark: ISpark, public context: ViewContext) {}
}
