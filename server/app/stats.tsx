import type { ServerMessage } from '../../client/types'
import type { ManagedWebsocket } from '../ws/wss.js'
import { o } from './jsx/jsx.js'
import { onWsSessionClose, sessions } from './session.js'
import { existsSync, mkdirSync, readFileSync, writeFile, rename } from 'fs'
import { debugLog } from '../debug.js'
import { join } from 'path'
import type { Context } from './context'

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
  const tmpfile = file + '.tmp.' + Math.random().toString(36).slice(2)
  writeFile(tmpfile, String(value), error => {
    if (error) {
      log('Failed to save number to temp file:', {
        tmpfile,
        file,
        value,
        error,
      })
    } else {
      rename(tmpfile, file, error => {
        if (error) {
          log('Failed to commit number to file:', {
            tmpfile,
            file,
            value,
            error,
          })
        }
      })
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

export function Stats(_attrs: {}, context: Context) {
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
