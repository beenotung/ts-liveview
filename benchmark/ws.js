// 1 ms/req with devtool closed

let span = speedSpan

let url = location.origin.replace('http', 'ws')
console.log({ url })
let ws = new WebSocket(url)
ws.onopen = sendMessage
ws.onmessage = onmessage

let start = 0
let end = 0
let usedTime = 0
let input = 0
let output = 0

let alpha = 0.99
let beta = 1 - alpha

function sendMessage() {
  start = Date.now()
  ws.send(JSON.stringify({ count: input }))
}

function onmessage(event) {
  let message = JSON.parse(event.data)
  output = message.count
  if (output !== input + 1) {
    throw new Error('wrong output')
  }
  end = Date.now()
  if (usedTime) {
    usedTime = usedTime * alpha + (end - start) * beta
  } else {
    usedTime = end - start
  }
  span.textContent = `${output}: ${usedTime}`
  input = output
  sendMessage()
}
