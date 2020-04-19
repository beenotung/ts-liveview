import fs from 'fs'
import path from 'path'
import S, { DataSignal } from 's-js'

export function makeCounter(name: string): DataSignal<number> {
  const visitorFile = path.join('data', name + '.txt')
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data')
  }
  const counter = S.data(0)
  if (fs.existsSync(visitorFile)) {
    const value = +fs.readFileSync(visitorFile).toString()
    if (value) {
      counter(value)
    }
  }
  S.root(() => {
    S.on(counter, () =>
      fs.writeFile(visitorFile, counter().toString(), err => {
        if (err) {
          console.error('failed to update visitor file')
        }
      }),
    )
  })
  return counter
}
