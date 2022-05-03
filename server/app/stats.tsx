import { ServerMessage } from '../../client/index.js'
import { ManagedWebsocket } from '../ws/wss.js'
import { getContext } from './context.js'
import JSX from './jsx/jsx.js'
import { onWsSessionClose, sessions } from './session.js'
import { existsSync, mkdirSync, readFileSync, writeFile } from 'fs'
import { debugLog } from '../debug.js'
import { join } from 'path'

let log = debugLog('stats.tsx')
log.enabled = true

function sendMessage(message: ServerMessage, skip?: ManagedWebsocket) {
  sessions.forEach(session => {
    if (session.ws !== skip) {
      session.ws.send(message)
    }
  })
}

function loadNumber(file: string): number {
  if (existsSync(file)) {
    return parseInt(readFileSync(file).toString())
  }
  return 0
}

function saveNumber(file: string, value: number) {
  writeFile(file, String(value), error => {
    if (error) {
      log('Failed to save number:', { file, value, error })
    }
  })
}

mkdirSync('data', { recursive: true })
let visitorFile = join('data', 'visitor.txt')
let sessionFile = join('data', 'session.txt')

let state = {
  visitor: loadNumber(visitorFile),
  session: loadNumber(sessionFile),
  live: new Set<ManagedWebsocket>(),
}

export function Stats(props: {}) {
  let context = getContext(props)
  let messages: ServerMessage[] = []
  if (context.type === 'express') {
    state.visitor++
    saveNumber(visitorFile, state.visitor)
    messages.push(['update-text', '#stats .visitor', state.visitor])
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
      state.live.delete(ws!)
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
    <div id="stats">
      <table>
        <tbody>
          <tr>
            <td>#visitor</td>
            <td class="visitor">{state.visitor}</td>
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
