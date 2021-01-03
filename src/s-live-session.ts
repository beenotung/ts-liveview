import debug from 'debug'
import S from 's-js'
import { ISpark } from 'typestub-primus'
import { Component } from './h'
import { LiveSession } from './live-session'

const log = debug('liveview:session')

export type LiveOptions = {
  skipInitialSend?: boolean
}

export class SLiveSession extends LiveSession {

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
  static spawnFromRoot<T extends SLiveSession>(
    sparkOrFn: ISpark | (() => T),
  ): T {
    return S.root(dispose => {
      const session =
        typeof sparkOrFn === 'function'
          ? sparkOrFn()
          : (new SLiveSession(sparkOrFn) as T)
      session.attachDispose(dispose)
      return session
    })
  }
}
