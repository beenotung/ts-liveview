import { ClientMessage } from '../message'

export function useClientMessage(f: (message: ClientMessage) => void) {
  return (message: string) => {
    f(JSON.parse(message))
  }
}
