import S from 's-js'
import { CommonRequest } from './request'
import { ServerMessage } from './types/message'
import { Patch, Statics } from './types/view'
import { ISpark } from 'typestub-primus'
import debug from 'debug'
import { Component, createDummyComponent, morphComponent } from './h'

let log = debug('liveview:session')

export type LiveOptions = {
  skipInitialSend?: boolean
}

export class Session {
  // template_id -> statics
  templates = new Map<string, Statics>()

  // selector -> last version component
  components = new Map<string, Component>()

  constructor(
    public spark: ISpark,
    public request: CommonRequest,
  ) {
  }

  sendMessage(message: ServerMessage) {
    this.spark.write(message)
  }

  sendPatch(patch: Patch) {
    log('send patch:', patch)
    this.sendMessage({
      type: 'patch',
      selector: patch.selector,
      templates: patch.templates,
      components: patch.components,
    })
  }

  sendComponent(target: Component) {
    log('send component:', target)
    let source = this.components.get(target.selector)
    let patch: Patch
    if (source) {
      log('has source')
      patch = morphComponent(source, target, this.templates, this.components)
    } else {
      log('no source')
      source = createDummyComponent()
      patch = morphComponent(source, target, this.templates, this.components)
      this.components.set(target.selector, target)
    }
    this.sendPatch(patch)
  }

  live(render: () => Component, options?: LiveOptions) {
    let initial = true
    return S(() => {
      let component = render()
      if (options?.skipInitialSend && initial) {
        initial = false
        return
      }
      this.sendComponent(component)
      return component
    })
  }

  attachDispose(dispose: () => void) {
    this.spark.on('close', () => {
      log(`spark is closed, dispose S-js context now`)
      dispose()
    })
    S.cleanup(() => {
      log(`S-js context is disposed, close spark now`)
      this.spark.end()
    })
  }
}

