import debug from 'debug'
import S from 's-js'
import { ISpark } from 'typestub-primus'
import { Component, createDummyComponent, morphComponent } from './h'
import { ClientParams, parseQuery } from './helpers/client-adaptor'
import { ClientMessage, ServerMessage } from './types/message'
import { Patch, Statics } from './types/view'

const log = debug('liveview:session')

export type LiveOptions = {
  skipInitialSend?: boolean
}

export class Session {
  // template_id -> statics
  templates = new Map<string, Statics>()

  // selector -> last version component
  components = new Map<string, Component>()

  // merge pathname and hash into search, then parsed into json
  params: ClientParams

  constructor(public spark: ISpark) {
    this.params = parseQuery(spark.query)
    log('params:', this.params)
  }

  sendMessage(message: ServerMessage) {
    this.spark.write(message)
  }

  sendPatch(patch: Patch) {
    // log('send patch:', patch)
    this.sendMessage({
      type: 'patch',
      selector: patch.selector,
      templates: patch.templates,
      components: patch.components,
    })
  }

  sendComponent(target: Component) {
    // log('send component:', target)
    let source = this.components.get(target.selector)
    let patch: Patch
    if (source) {
      // log('has source')
      patch = morphComponent(source, target, this.templates, this.components)
    } else {
      // log('no source')
      source = createDummyComponent()
      patch = morphComponent(source, target, this.templates, this.components)
      this.components.set(target.selector, target)
    }
    this.sendPatch(patch)
  }

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

  onClose(cb: () => void) {
    this.spark.on('end', cb)
  }

  onMessage(cb: (args: ClientMessage) => void) {
    this.spark.on('data', cb)
  }
}
