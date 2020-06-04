import { allNames } from '@beenotung/tslib/constant/character-name'
import { Random } from '@beenotung/tslib/random'
import SArray from 's-array'
import S, { DataSignal } from 's-js'
import { Session } from './lib'
import { messages, typing } from './views/chatroom'
import { globalSRoot } from './views/global'

export let online = globalSRoot.spawn(() =>
  SArray([] as Array<DataSignal<string>>),
)

export class State {
  name = S.data(Random.element(allNames))
  message = S.data('')

  removeTimer?: any

  constructor(public session: Session) {
    session.onMessage(args => {
      switch (args[0]) {
        case 'name':
          this.name(args[1])
          return
        case 'message':
          this.message(args[1])
          return
        case 'send':
          this.send()
          return
        default:
          console.log('unknown message:', args)
      }
    })
    S.sample(() => online.push(this.name))
    S.on(this.name, () => this.addTyping())
    S.on(this.message, () => this.addTyping())
    S.cleanup(final => {
      if (final) {
        online.remove(this.name)
        this.removeTyping()
      }
    })
  }

  addTyping() {
    clearTimeout(this.removeTimer)
    this.removeTimer = setTimeout(() => this.removeTyping(), 2000)
    S.sample(() => {
      if (!typing().includes(this.name)) {
        typing.push(this.name)
      }
    })
  }

  removeTyping() {
    S.sample(() => {
      typing.remove(this.name)
    })
  }

  send() {
    S.sample(() => {
      const message = this.message()
      this.message('')
      messages.push({
        id: messages().length,
        name: this.name(),
        time: Date.now(),
        text: message,
      })
    })
  }
}
