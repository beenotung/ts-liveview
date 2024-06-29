import type { ServerMessage } from '../../../client/types'
import type { ManagedWebsocket } from '../../ws/wss.js'
import { o } from '../jsx/jsx.js'
import { onWsSessionClose, sessions } from '../session.js'
import { existsSync, renameSync } from 'fs'
import { join } from 'path'
import type { Context } from '../context'
import { loadNumber, saveNumber } from '../data/version-number.js'

function sendMessage(message: ServerMessage, skip?: ManagedWebsocket) {
  sessions.forEach(session => {
    if (session.ws !== skip) {
      session.ws.send(message)
    }
  })
}

let visitFile = join('data', 'visit.txt')
let _visitorFile = join('data', 'visitor.txt')
let sessionFile = join('data', 'session.txt')

function migrateVisitFile() {
  if (existsSync(_visitorFile) && !existsSync(visitFile)) {
    renameSync(_visitorFile, visitFile)
  }
}
migrateVisitFile()

let state = {
  visit: loadNumber(visitFile),
  session: loadNumber(sessionFile),
  live: new Set<ManagedWebsocket>(),
}

export function Stats(attrs: { hidden?: boolean }, context: Context) {
  let messages: ServerMessage[] = []
  if (context.type === 'express') {
    state.visit++
    saveNumber(visitFile, state.visit)
    messages.push(['update-text', '#stats .visit', state.visit])
  }
  let ws: ManagedWebsocket | undefined
  if (context.type === 'ws') {
    ws = context.ws
    if (!state.live.has(ws)) {
      state.session++
      saveNumber(sessionFile, state.session)
      state.live.add(ws)
    }
    messages.push(
      ['update-text', '#stats .session', state.session],
      ['update-text', '#stats .live', state.live.size],
    )
    onWsSessionClose(ws, session => {
      let ws = session.ws
      state.live.delete(ws)
      let message: ServerMessage = [
        'update-text',
        '#stats .live',
        state.live.size,
      ]
      sendMessage(message)
    })
  }
  sendMessage(['batch', messages], ws)
  return (
    <div id="stats" hidden={attrs.hidden || undefined}>
      <table>
        <tbody>
          <tr>
            <td>#visit</td>
            <td class="visit">{state.visit}</td>
          </tr>
          <tr>
            <td>#session</td>
            <td class="session">{state.session}</td>
          </tr>
          <tr>
            <td>#live-session</td>
            <td class="live">{state.live.size}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Stats
