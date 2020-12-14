import debug from 'debug'
import S from 's-js'
import { Component } from './h'
import { Session } from './session'

const log = debug('liveview:session')

export type LiveOptions = {
  skipInitialSend?: boolean
}

export class SSession extends Session {
  live(render: () => Component, options?: LiveOptions) {
    let initial = true
    return S(() => {
      const component = render()
      if (options?.skipInitialSend && initial) {
        initial = false
        return
      }
      this.sendComponent(component)
      return component
    })
  }

  attachDispose(dispose: () => void) {
    this.onClose(() => {
      log(`spark is closed, dispose S-js context now`)
      dispose()
    })
    S.cleanup(() => {
      log(`S-js context is disposed, close spark now`)
      this.spark.end()
    })
  }
}
