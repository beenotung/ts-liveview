import { ClientMessage, ServerMessage } from '../message'

export function useClientMessage(f: (message: ClientMessage) => void) {
  return (message: string) => {
    f(JSON.parse(message))
  }
}
