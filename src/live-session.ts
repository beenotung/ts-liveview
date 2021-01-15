import debug from 'debug'
import { ISpark } from 'typestub-primus'
import { Component, createDummyComponent, morphComponent } from './h'
import { MessageType } from './types/enum'
import { ClientMessage, ServerMessage } from './types/message'
import { Patch, Statics } from './types/view'

const log = debug('liveview:live-session')

export class LiveSession {
  // template_id -> statics
  templates = new Map<string, Statics>()

  // selector -> last version component
  components = new Map<string, Component>()

  constructor(public spark: ISpark) {}

  sendMessage(message: ServerMessage) {
    this.spark.write(message)
  }

  sendPatch(patch: Patch) {
    log('send patch:', patch)
    this.sendMessage({
      type: MessageType.patch,
      s: patch.s,
      t: patch.t?.length! > 0 ? patch.t : undefined,
      c: patch.c,
    })
  }

  sendComponent(target: Component) {
    log('send component:', target)
    let source = this.components.get(target.selector)
    let patch: Patch
    if (source) {
      patch = morphComponent(source, target, this.templates, this.components)
    } else {
      source = createDummyComponent()
      patch = morphComponent(source, target, this.templates, this.components)
      this.components.set(target.selector, target)
    }
    this.sendPatch(patch)
  }

  onClose(cb: () => void) {
    this.spark.on('end', cb)
  }

  onMessage(cb: (args: ClientMessage) => void) {
    this.spark.on('data', cb)
  }
}
