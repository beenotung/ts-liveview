import S, { DataSignal } from 's-js'
import WebSocket from 'ws'
import { diff, isTemplateSame, Template, toHTML } from './h'
import { ServerMessage } from './message'
import { IncomingMessage } from './types'

export class Component {
  lastTemplate?: Template
  constructor(public session: Session, public selector: string) {}

  render(target: Template, selector?: string) {
    if (selector) {
      this.selector = selector
    } else {
      selector = this.selector
    }
    if (
      !this.lastTemplate ||
      !isTemplateSame(this.lastTemplate.statics, target.statics)
    ) {
      this.lastTemplate = target
      this.session.sendMessage({
        type: 'repaint',
        selector,
        template: target,
      })
      return
    }
    this.session.sendMessage({
      type: 'patch',
      selector,
      diff: diff(this.lastTemplate.dynamics, target.dynamics),
    })
    this.lastTemplate.dynamics = target.dynamics
  }
}

export class Session {
  onMessage?: (message: string) => void

  constructor(public ws: WebSocket, public request: IncomingMessage) {}

  sendMessage(message: ServerMessage) {
    this.ws.send(JSON.stringify(message))
  }

  createComponent(selector: string): Component {
    return new Component(this, selector)
  }

  createSComponent(selector: string, templateSignal: DataSignal<Template>) {
    const component = this.createComponent(selector)
    S(() => component.render(templateSignal()))
    return { component, templateSignal }
  }

  S(selector: string, templateF: () => Template) {
    const res = this.createSComponent(
      selector,
      S(() => templateF()),
    )
    const templateSignal = res.templateSignal
    return Object.assign(templateSignal, res.component, {
      sampleHTML: () => toHTML(S.sample(templateSignal)),
    })
  }
}
