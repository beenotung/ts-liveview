import { ManagedWebsocket } from '../../../ws/wss.js'
import JSX from '../../jsx/jsx.js'
import { Component, NodeList } from '../../jsx/types.js'
import { onWsSessionClose } from '../../session.js'
import { remove } from '@beenotung/tslib/array.js'
import { allNames } from '@beenotung/tslib/constant/character-name.js'
import { Random } from '@beenotung/tslib/random.js'

export type ChatSession = {
  nickname: string
  nickname_node: Component
}

const session_map = new WeakMap<ManagedWebsocket, ChatSession>()

function startChatSession(ws: ManagedWebsocket) {
  const session: ChatSession = {
    nickname: Random.element(allNames),
    nickname_node: [() => <span>{session.nickname}</span>],
  }
  session_map.set(ws, session)
  online_node_list.push(session.nickname_node)
  onWsSessionClose(ws, () => {
    session_map.delete(ws)
    remove(online_node_list, session.nickname_node)
  })
  return session
}

export function getChatSession(ws: ManagedWebsocket): ChatSession {
  return session_map.get(ws) || startChatSession(ws)
}

const typing_timeout = 2000
export const typing_node_list: NodeList = []
export function markTyping(session: ChatSession) {
  typing_node_list.push(session.nickname_node)
  setTimeout(() => {
    remove(typing_node_list, session.nickname_node)
  }, typing_timeout)
}

export const online_node_list: NodeList = []
