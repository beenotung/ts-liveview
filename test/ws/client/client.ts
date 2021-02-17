// reference: https://github.com/Luka967/websocket-close-codes
export const CLOSE_NORMAL = 1000
export const CLOSE_GOING_AWAY = 1001
export const MANDATORY_EXTENSION = 1010
export const SERVICE_RESTART = 1012
export const TRY_AGAIN_LATER = 1013

export type WebsocketData = string | ArrayBufferLike | Blob | ArrayBufferView

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

export function defaultSendQueue(
  options: {
    storageKey?: string // key to persist with localStorage. If omited, will not be persisted
  } = {},
) {
  let queue: WebsocketData[] = []
  const KEY = options.storageKey
  if (KEY) {
    queue = JSON.parse(localStorage.getItem(KEY) || '[]')
  }
  function push(data: WebsocketData) {
    queue.push(data)
    if (KEY) { localStorage.setItem(KEY, JSON.stringify(queue)) }
  }
  function clear() {
    queue = []
    if (KEY) { localStorage.removeItem(KEY) }
  }
  function toArray() {
    return queue
  }
  return { push, clear, toArray }
}

export function createWebsocketClient(options: {
  url?: string
  initWS: (ws: WebSocket, oldWs: WebSocket | null) => void
  shouldReconnect?: typeof defaultShouldReconnect
  backoffStrategy?: ReturnType<typeof defaultBackoffStrategy>
  sendQueue?: ReturnType<typeof defaultSendQueue>
}) {
  let ws: WebSocket
  let shouldReconnect = true
  let isOpened = false
  const backoffStrategy = options.backoffStrategy || defaultBackoffStrategy()
  const sendQueue =
    options.sendQueue || defaultSendQueue({ storageKey: 'sendQueue' })
  function close(
    code: number = CLOSE_NORMAL,
    reason?: string,
    wsCallback?: (ws: WebSocket) => void,
  ) {
    shouldReconnect = false
    ws.close(code, reason)
    if (wsCallback) {
      wsCallback(ws)
    }
  }
  function refresh() {
    shouldReconnect = true
    ws.close(SERVICE_RESTART)
    open()
  }
  function open() {
    const oldWs = ws || null
    const url = options.url || location.href.replace('http', 'ws')
    ws = new WebSocket(url)
    ws.addEventListener('open', () => {
      isOpened = true
      backoffStrategy.onSuccess()
      sendQueue.toArray().forEach(data => ws.send(data))
      sendQueue.clear()
    })
    ws.addEventListener('close', event => {
      isOpened = false
      const predicate = options.shouldReconnect || defaultShouldReconnect
      if (shouldReconnect && predicate(event)) {
        backoffStrategy.onFailure()
        setTimeout(open, backoffStrategy.getInterval())
      }
    })
    options.initWS(ws, oldWs)
    return ws
  }
  function send(data: WebsocketData) {
    if (isOpened) {
      ws.send(data)
    } else {
      sendQueue.push(data)
    }
  }
  open()
  return {
    close,
    refresh,
    send,
  }
}
