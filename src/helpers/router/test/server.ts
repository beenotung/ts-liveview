import express from 'express'

const app = express()
app.use((req, res, next) => {
  // sample req.url: /users/1/username?lang=en
  console.log(req.method, req.url)
  next()
})
const port = 8100
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
