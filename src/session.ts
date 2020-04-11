import S from 's-js'
import WebSocket from 'ws'
import { calcDiff, isTemplateSame } from './h'
import { ServerMessage } from './types/message'
import { IncomingMessage } from './types/server'
import { ComponentTemplate, Render, TemplateDiff } from './types/view'

export type LiveOptions = {
  skipInitialSend?: boolean
}

export class Session {
  onMessage?: (message: string) => void

  // selector -> last Template
  templates = new Map<string, ComponentTemplate>()

  constructor(public ws: WebSocket, public request: IncomingMessage) {}

  sendMessage(message: ServerMessage) {
    this.ws.send(JSON.stringify(message))
  }

  resendTemplate(selector: string) {
    const template = this.templates.get(selector)
    if (!template) {
      console.log('failed to lookup template cache of selector:', selector)
      return
    }
    console.log('resend template of', selector)
    this.sendMessage({
      type: 'render',
      ...template,
    })
  }

  sendDiff(diff: TemplateDiff) {
    this.sendMessage({
      type: 'patch',
      ...diff,
    })
  }

  sendTemplate(target: ComponentTemplate) {
    const selector = target.selector
    const last = this.templates.get(selector)
    if (last && isTemplateSame(last.statics, target.statics)) {
      const diff = calcDiff(last.dynamics, target.dynamics)
      this.sendDiff({
        selector,
        diff,
      })
      last.dynamics = target.dynamics
      return
    }
    this.sendMessage({
      type: 'render',
      ...target,
    })
    this.templates.set(selector, target)
  }

  live(render: Render, options?: LiveOptions) {
    let initial = true
    return S(() => {
      const template = render()
      if (options?.skipInitialSend && initial) {
        initial = false
        return
      }
      this.sendTemplate(template)
      return template
    })
  }

  once(event: 'close', dispose: () => void) {
    this.ws.addEventListener('close', dispose)
    S.cleanup(() => this.ws.removeEventListener('close', dispose))
  }
}
