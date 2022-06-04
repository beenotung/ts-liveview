function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let url = '/test.stream'

async function start() {
  let stream = new ReadableStream({
    async start(controller) {
      function write(chunk) {
        console.log('write:', chunk)
        controller.enqueue(chunk)
      }
      await wait(1000)
      write('This ')
      await wait(1000)
      write('is ')
    },
  })
  let request = new Request('/test.stream', {
    allowHTTP1ForStreamingUpload: true,
    method: 'POST',
    body: stream,
  })
  let resP = fetch(request, {})
}
