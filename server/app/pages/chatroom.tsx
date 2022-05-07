import { allNames } from '@beenotung/tslib/constant/character-name.js'
import { Random } from '@beenotung/tslib/random.js'
import { ServerMessage } from '../../../client/index.js'
import { debugLog } from '../../debug.js'
import { Style } from '../components/style.js'
import { getContext, WsContext } from '../context.js'
import { getContextCookie } from '../cookie.js'
import JSX from '../jsx/jsx.js'
import { attrs, Node } from '../jsx/types.js'
import { onWsSessionClose, sessions } from '../session.js'
import { ManagedWebsocket } from '../../ws/wss.js'
import { EarlyTerminate } from '../helpers.js'
import DateTimeText from '../components/datetime.js'
import { nodeToVNode } from '../jsx/vnode.js'

let log = debugLog('chatroom.tsx')
log.enabled = true

const style = Style(/* css */ `
#chatroom label {
  text-transform: capitalize;
  margin-top: 0.5em;
}
#chatroom label::after {
  content: ":";
}
#chatroom .name-list span::after {
  content: ", "
}
#chatroom .name-list span:last-child::after {
  content: ""
}
#chatroom .chat-time {
  font-size: small;
}
#chatroom .chat-author {
  font-weight: bold;
}
#chatroom .chat-author::after {
  content: ": ";
  font-weight: normal;
}
#chatroom .msg-list {
  display: flex;
  flex-direction: column-reverse;
}
#chatroom .chat-record {
  flex: 0 0 auto;
}
`)

const typing_timeout = 1000 * 5

type NameSpan = ['span', { id: string }, [name: string]]
const NameNode = {
  attr: 1 as const,
  name: 2 as const,
}

function sendMessage(message: ServerMessage) {
  sessions.forEach(session => {
    if (session.url?.startsWith('/chatroom')) {
      session.ws.send(message)
    }
  })
}

function sendCustomMessage(fn: (ws: ManagedWebsocket) => ServerMessage) {
  sessions.forEach(session => {
    if (session.url?.startsWith('/chatroom')) {
      let ws = session.ws
      ws.send(fn(ws))
    }
  })
}

function remove<T>(array: T[], item: T, onRemove: () => void) {
  let index = array.indexOf(item)
  if (index === -1) return
  array.splice(index, 1)
  onRemove()
}

class ChatroomState {
  msg_list: Node[] = []
  online_span_list: NameSpan[] = []
  typing_span_list: NameSpan[] = []

  typing_timeout_map = new Map<NameSpan, NodeJS.Timeout>()

  addMessage(nickname: string, message: string) {
    let now = new Date()
    let time = now.getTime()
    let li = (
      <li class="chat-record">
        <time class="chat-time" datetime={now.toISOString()}>
          [<DateTimeText time={time} />]
        </time>{' '}
        <br />
        <span class="chat-author">{nickname}</span>
        <span class="chat-message">{message}</span>
      </li>
    )
    this.msg_list.push(li)
    sendCustomMessage(ws => {
      let context: WsContext = { type: 'ws', ws } as any
      let node = nodeToVNode(li, context)
      return ['append', '#chatroom .msg-list', node]
    })
  }
  addTyping(span: NameSpan) {
    let timeout = this.typing_timeout_map.get(span)
    if (timeout) {
      clearTimeout(timeout)
    }
    if (!this.typing_span_list.includes(span)) {
      this.typing_span_list.push(span)
      sendMessage(['append', '#chatroom .typing-list', span])
    }
    const remove = () => {
      const idx = this.typing_span_list.indexOf(span)
      if (idx === -1) return
      this.typing_span_list.splice(idx, 1)
      sendMessage([
        'remove',
        '#chatroom .typing-list span#' + span[NameNode.attr].id,
      ])
    }
    timeout = setTimeout(remove, typing_timeout)
    this.typing_timeout_map.set(span, timeout)
  }
  addOnline(span: NameSpan) {
    this.online_span_list.push(span)
    sendMessage(['append', '#chatroom .online-list', span])
  }
}
class ChatUserSession {
  static nextId = 1
  span: NameSpan
  constructor(public room: ChatroomState, public id: string, nickname: string) {
    this.span = ['span', { id }, [nickname]]
    room.addOnline(this.span)
  }
  rename(nickname: string) {
    this.span[NameNode.name][0] = nickname
    const message: ServerMessage = [
      'update-all-text',
      `#chatroom .name-list span#${this.id}`,
      nickname,
    ]
    sessions.forEach((session, ws) => {
      const url = session.url
      if (url && url.startsWith('/chatroom')) {
        ws.send(message)
      }
    })
  }
  markTyping() {
    this.room.addTyping(this.span)
  }
  markOffline() {
    remove(this.room.online_span_list, this.span, () =>
      sendMessage([
        'remove',
        '#chatroom .online-list span#' + this.span[NameNode.attr].id,
      ]),
    )
    remove(this.room.typing_span_list, this.span, () => {
      sendMessage([
        'remove',
        '#chatroom .typing-list span#' + this.span[NameNode.attr].id,
      ])
    })
  }

  static ws_state_map = new WeakMap<ManagedWebsocket, ChatUserSession>()
  static fromWS(
    room: ChatroomState,
    ws: ManagedWebsocket,
    nickname: string,
  ): ChatUserSession {
    const session = this.ws_state_map.get(ws)
    if (session) return session
    let id = 'author-' + this.nextId
    this.nextId++
    const newSession = new ChatUserSession(room, id, nickname)
    this.ws_state_map.set(ws, newSession)
    onWsSessionClose(ws, () => {
      newSession.markOffline()
    })
    return newSession
  }
}
let room = new ChatroomState()
room.addMessage('System', 'Hello World')

function randomName() {
  const name = Random.element(allNames)
  // TODO avoid name clash
  log('new name:', name)
  return name
}

function getChatSession(attrs: attrs) {
  let context = getContext(attrs)
  if (context.type !== 'ws') {
    throw new Error('this route is only for ws context')
  }
  let session = ChatUserSession.ws_state_map.get(context.ws)
  if (!session) {
    throw new Error('session not found')
  }
  return {
    session,
    context,
    ws: context.ws,
  }
}

export function typing(attrs: attrs) {
  let { session } = getChatSession(attrs)
  session.markTyping()
  throw EarlyTerminate
}

export function rename(attrs: attrs) {
  let { session, context } = getChatSession(attrs)
  let newNickname = context.args?.[0]
  if (!newNickname) {
    throw new Error('missing nickname in args')
  }
  session.rename(newNickname)
  throw EarlyTerminate
}

export function send(attrs: attrs) {
  let context = getContext(attrs)
  if (context.type === 'express') {
    const { req, res } = context
    if (req.method !== 'POST') {
      res.status(405).end('Only POST is allowed on this route')
      return
    }
    if (!req.body) {
      res.status(400).end('Missing json body in request')
      return
    }
    let { nickname, message } = req.body
    if (!message) {
      res.status(400).end('Missing message in request body')
      return
    }
    nickname = nickname || randomName()
    room.addMessage(nickname, message)
    return
  }
  if (context.type === 'ws') {
    let body = context.args?.[0]
    if (!body) {
      throw new Error('Missing form body in args')
    }
    let { nickname, message } = body
    if (!message) {
      throw new Error('Missing message in args')
    }
    nickname = nickname || randomName()
    room.addMessage(nickname, message)
    let update: ServerMessage = ['set-value', '#chatroom form #message', '']
    context.ws.send(update)
    throw EarlyTerminate
  }
  throw new Error('unknown context type:' + context.type)
}

export function Chatroom(attrs: attrs) {
  let context = getContext(attrs)
  let cookies = getContextCookie(context)
  let nickname = cookies?.nickname || ''
  log({ type: context.type, cookies })
  switch (context.type) {
    case 'express': {
      const { req, res } = context
      if (req.method === 'POST') {
        nickname = req.body.nickname || nickname || randomName()
        if (req.cookies.nickname !== nickname) {
          res.cookie('nickname', nickname, { sameSite: 'lax' })
        }
        let message = req.body.message
        if (message) {
          room.addMessage(nickname, message)
        }
        break
      }
      if (req.method === 'GET' && !nickname) {
        nickname = randomName()
        res.cookie('nickname', nickname, { sameSite: 'lax' })
        break
      }
      break
    }
    case 'ws': {
      let ws = context.ws
      let body = context.args?.[0]
      if (body) {
        nickname = body.nickname || nickname
      }
      if (!nickname) {
        nickname = randomName()
        if (cookies) {
          cookies.nickname = nickname
        }
        let message: ServerMessage = [
          'set-cookie',
          `nickname=${nickname};SameSite=lax`,
        ]
        ws.send(message)
      }
      ChatUserSession.fromWS(room, ws, nickname)
      if (body?.message) {
        room.addMessage(nickname, body.message)
      }
      break
    }
  }
  return (
    <>
      {style}
      <div id="chatroom">
        <h2>Chatroom Demo</h2>
        <p>
          The locale is detected from HTTP header <code>accept-language</code>{' '}
          in the initial request.
        </p>
        <p>
          When Javascript is enabled, the timeZone is detected from{' '}
          <code>Intl.DateTimeFormat().resolvedOptions().timeZone</code>
        </p>
        <form method="POST" onsubmit="emitForm(event)" action="/chatroom/send">
          <div>
            <label for="nickname">nickname</label>
            <input
              type="text"
              name="nickname"
              id="nickname"
              value={nickname}
              pattern="[a-zA-Z0-9 ]+"
              minlength="1"
              maxlength="70"
              oninput="emit('/chatroom/rename', this.value)"
            />
          </div>
          <div>
            <label for="message">message</label>
            <input
              type="text"
              name="message"
              id="message"
              oninput="emit('/chatroom/typing')"
            />
          </div>
          <input type="submit" value="Send" />
        </form>
        <p class="name-list online-list" style="color: green">
          Online: {[room.online_span_list]}
        </p>
        <p class="name-list typing-list" style={`color: grey; opacity: ${1}`}>
          Typing: {[room.typing_span_list]}
        </p>
        <p>Number of messages: {room.msg_list.length}</p>
        <ol class="msg-list">{[room.msg_list]}</ol>
      </div>
    </>
  )
}
export default {
  index: Chatroom,
  typing,
  rename,
  send,
}
