import WebSocket from 'ws'

// reference: https://github.com/Luka967/websocket-close-codes
export const CLOSE_NORMAL = 1000
export const CLOSE_GOING_AWAY = 1001
export const MANDATORY_EXTENSION = 1010
export const SERVICE_RESTART = 1012
export const TRY_AGAIN_LATER = 1013

export function defaultShouldReconnect(
  event: WebSocketEventMap['close'],
): boolean {
  switch (event.code) {
    case CLOSE_NORMAL:
    case CLOSE_GOING_AWAY:
    case MANDATORY_EXTENSION:
      return false
    default:
      return true
  }
}

const defaultMinInterval = 250
const defaultMaxInterval = 10 * 1000
const defaultRate = 1.5
export function defaultBackoffStrategy(
  options: {
    minInterval?: number // default 250 ms, should be > 0
    maxInterval?: number // default 10 seconds, should be > 0
    rate?: number // default 1.5, should be >= 1
  } = {},
) {
  let interval: number =
    options.minInterval! > 0 ? options.minInterval! : defaultMinInterval
  return {
    getInterval() {
      // TODO add random factor
      return interval
    },
    onSuccess() {
      interval =
        options.minInterval! > 0 ? options.minInterval! : defaultMinInterval
    },
    onFailure() {
      interval *= options.rate! >= 1 ? options.rate! : defaultRate
      const max: number =
        options.maxInterval! > 0 ? options.maxInterval! : defaultMaxInterval
      if (interval > max) {
        interval = max
      }
    },
  }
}

export function createWebsocketClient(options: {
  url?: string
  initWS: (ws: WebSocket, oldWs: WebSocket | null) => void
  shouldReconnect?: typeof defaultShouldReconnect
  backoffStrategy?: ReturnType<typeof defaultBackoffStrategy>
}) {
  let ws = open()
  let shouldReconnect = true
  let isOpened = false
  const backoffStrategy = options.backoffStrategy || defaultBackoffStrategy()
  function close(
    code: number = CLOSE_NORMAL,
    reason?: string,
    wsCallback?: (ws: WebSocket) => void,
  ) {
    shouldReconnect = false
    ws.close(code, reason)
    if (wsCallback) { wsCallback(ws) }
  }
  function refresh() {
    shouldReconnect = true
    ws.close(SERVICE_RESTART)
    ws = open()
  }
  function open(): WebSocket {
    const oldWs = ws || null
    const url = options.url || location.href.replace('http', 'ws')
    ws = new WebSocket(url)
    ws.addEventListener('open', () => {
      isOpened = true
      backoffStrategy.onSuccess()
    })
    ws.addEventListener('close', event => {
      isOpened = false
      const predicate = options.shouldReconnect || defaultShouldReconnect
      if (shouldReconnect && predicate(event as any)) {
        backoffStrategy.onFailure()
        setTimeout(() => {
          ws = open()
        }, backoffStrategy.getInterval())
      }
    })
    options.initWS(ws, oldWs)
    return ws
  }
  function send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (isOpened) {
      ws.send(data)
    } else {
      console.log('TODO cannot send when the socket is not opened')
    }
  }
  return {
    close,
    refresh,
    send,
  }
}
