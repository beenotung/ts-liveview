import JSX from '../jsx/jsx.js'
import { getContext } from '../context.js'
import { attrs, Node, NodeList } from '../jsx/types.js'
import { join } from 'path'
import { Update } from '../components/update.jsx'
import { Style } from '../components/style.js'
import { mapArray } from '../components/fragment.js'
import { getContextCookie } from '../cookie.js'
import { getContextToken } from '../auth/token.js'
import { Link } from '../components/router.js'
import { onWsSessionClose, Session } from '../session.js'
import { ManagedWebsocket } from '../../ws/wss.js'
import { typing_node_list } from './chatroom/session.js'

let msgs: Node[] = []

let style = Style(/* css */ `
#chatroom label {
  text-transform: capitalize;
  margin-top: 0.5em;
}
#chatroom label::after {
  content: ":";
}
`)

export function Chatroom(attrs: attrs) {
  let context = getContext(attrs)
  let cookies = getContextCookie(context)
  let nickname = cookies?.nickname
  if (context.type === 'express' && context.req.method === 'POST') {
    let { nickname, message } = context.req.body.nickname
    context.res.cookie('nickname', nickname, { sameSite: 'strict' })
    let now = new Date()
    msgs.push(
      <li>
        {nickname}:{' '}
        <time datetime={now.toISOString()}>{now.toLocaleString()}</time>
        <p>{message}</p>
      </li>,
    )
  }
  typing_node_list
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
        <p style="color: green">Online: </p>
        <p
          style={`color: grey; opacity: ${typing_node_list.length > 1 ? 1 : 0}`}
        >
          Typing: {mapArray(typing_node_list, echo, ', ')}
        </p>
        <p>Number of messages: {msgs.length}</p>
        <ol reversed>{[msgs]}</ol>
      </div>
    </>
  )
}
export default Chatroom

const echo = <T,>(x: T): T => x
