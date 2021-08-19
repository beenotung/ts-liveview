import JSX from '../jsx/jsx.js'
import { getContext } from '../context.js'
import { Element, attrs, Node, NodeList } from '../jsx/types.js'
import { join } from 'path'
import { Update } from '../components/update.jsx'
import { Style } from '../components/style.js'
import { mapArray } from '../components/fragment.js'
import { getContextCookie } from '../cookie.js'
import { getContextToken } from '../auth/token.js'
import { Link } from '../components/router.js'
import { onWsSessionClose, Session } from '../session.js'
import { ManagedWebsocket } from '../../ws/wss.js'
import { format_datetime } from '@beenotung/tslib/format.js'
import { Fragment } from '../jsx/types'

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
#chatroom .chat-list {
  display: flex;
  flex-direction: column-reverse;
}
#chatroom .chat-record {
  flex: 0 0 auto;
}
`)

const typing_timeout = 2000
type NameSpan = ['span', {}, [name: string]]
const NameNode = {
  name: 2 as const,
}
class ChatroomState {
  msg_list: Node[] = []
  online_span_list: NameSpan[] = []
  typing_span_list: NameSpan[] = []

  addMessage(nickname: string, message: string) {
    let now = new Date()
    let li = (
      <li class="chat-record">
        <time class="chat-time" datetime={now.toISOString()}>
          [{format_datetime(now.getTime())}]
        </time>{' '}
        <br />
        <span class="chat-author">{nickname}</span>
        <span class="chat-message">{message}</span>
      </li>
    )
    this.msg_list.push(li)
  }
  addTyping(nickname: string) {
    const span: NameSpan = ['span', {}, [nickname]]
    this.typing_span_list.push(span)
    const remove = () => {
      const idx = this.typing_span_list.indexOf(span)
      if (idx !== 1) this.typing_span_list.splice(idx, 1)
    }
    setTimeout(remove, typing_timeout)
    return remove
  }
  addOnline(nickname: string) {
    const span: NameSpan = ['span', {}, [nickname]]
    this.online_span_list.push(span)
    const remove = () => {
      const idx = this.online_span_list.indexOf(span)
      if (idx !== 1) this.online_span_list.splice(idx, 1)
    }
    return { remove, span }
  }
  rename(from: string, to: string) {
    // TODO notice all clients to update
    ;[this.online_span_list, this.typing_span_list].forEach(list => {
      list.find(node => {
        const nameList = node[NameNode.name]
        if (nameList[0] === from) {
          nameList[0] = to
          return
        }
      })
    })
  }
}
let state = new ChatroomState()
state.addOnline('alice')
state.addOnline('bob')
state.addOnline('charlie')
state.addTyping('alice')
state.addTyping('bob')
state.addMessage('alice', 'hi')
state.addMessage('bob', 'second message')

export function Chatroom(attrs: attrs) {
  let context = getContext(attrs)
  let cookies = getContextCookie(context)
  let nickname = cookies?.nickname
  if (context.type === 'express' && context.req.method === 'POST') {
    let { nickname, message } = context.req.body.nickname
    context.res.cookie('nickname', nickname, { sameSite: 'strict' })
    state.addMessage(nickname, message)
  }
  return (
    <>
      {style}
      <div id="chatroom">
        <h2>Chatroom Demo</h2>
        <form method="POST" onsubmit="emitForm(event)">
          <div>
            <label for="nickname">nickname</label>
            <input type="text" name="nickname" id="nickname" />
          </div>
          <div>
            <label for="message">message</label>
            <input type="text" name="message" id="message" />
          </div>
          <input type="submit" value="Send" />
        </form>
        <p class="name-list" style="color: green">
          Online: {[state.online_span_list]}
        </p>
        <p class="name-list" style={`color: grey; opacity: ${1}`}>
          Typing: {[state.typing_span_list]}
        </p>
        <p>Number of messages: {state.msg_list.length}</p>
        <ol class="chat-list">{[state.msg_list]}</ol>
      </div>
    </>
  )
}
export default Chatroom
