// 45 ms/req with devtool closed

let span = speedSpan

let headers = { 'Content-Type': 'application/json' }

function test(count) {
  return fetch('/inc', {
    method: 'POST',
    headers,
    body: JSON.stringify({ count }),
  }).then(toJSON)
}

function toJSON(res) {
  return res.json().then(toCount)
}

function toCount(json) {
  return json.count
}

let alpha = 0.99
let beta = 1 - alpha

async function benchmark() {
  let input = 0
  let output = 0
  let start = 0
  let end = 0
  let usedTime = 0
  for (;;) {
    start = Date.now()
    output = await test(input)
    if (output !== input + 1) {
      throw new Error('wrong response')
    }
    end = Date.now()
    if (usedTime) {
      usedTime = usedTime * alpha + (end - start) * beta
    } else {
      usedTime = end - start
    }
    // console.log(output, usedTime)
    span.textContent = `${output}: ${usedTime}`
    input = output
  }
}

benchmark()
