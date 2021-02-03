let primus = Primus.connect()
primus.on('open', function open() {
  console.log('Connection is alive and kicking')
})
primus.on('error', err => {
  console.log('error', err)
})
primus.on('reconnect', function(opts) {
  console.log('Reconnection attempt started')
})
primus.on('reconnect scheduled', function(opts) {
  console.log('Reconnecting in %d ms', opts.scheduled)
  console.log('This is attempt %d out of %d', opts.attempt, opts.retries)
})
primus.on('reconnected', function(opts) {
  console.log('It took %d ms to reconnect', opts.duration)
})
primus.on('reconnect timeout', function(err, opts) {
  console.log('Timeout expired: %s', err.message)
})
primus.on('reconnect failed', function(err, opts) {
  console.log('The reconnection failed: %s', err.message)
})
primus.on('end', function() {
  console.log('Connection closed')
})
primus.on('data', data => {
  console.log('data', data)
})
primus.write({ from: 'client', msg: 'hi' })
