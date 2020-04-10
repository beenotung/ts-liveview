import morphdom from 'morphdom'

let app = document.createElement('div')
document.body.appendChild(app)
let items: any[] = []

function randomValue() {
  return Math.floor(Math.random() * 10)
}

items.push(randomValue())

function mutateArray(items: any[]) {
  let idx = Math.floor(Math.random() * items.length)
  let item = items[idx]
  let value = Math.random() < 0.9 ? randomValue() : [randomValue()]
  if (Array.isArray(item)) {
    if (Math.random() < 0.5)
      mutateArray(item)
    else
      item.push(value)
  } else {
    if (Math.random() < 0.5)
      items[idx] = value
    else
      items.push(value)
  }
}

let colors = new Map()
let cs = ['red', 'green', 'blue']

function color(items: any[]) {
  if (colors.has(items)) {
    return colors.get(items)
  }
  let c = cs[Math.floor(Math.random() * cs.length)]
  colors.set(items, c)
  return c
}

function renderArray(items: any[]): string {
  return `<span style="color: ${color(items)}; word-wrap: break-word">${items.map(x => `${Array.isArray(x) ? renderArray(x) : x}`).join('')}</span>`
}

setInterval(() => {
  mutateArray(items)

  let target = `<div>
now is: <span>${Date.now()}</span>
<br>
${new Date().toLocaleString()}
${renderArray(items)}
</div>`
  morphdom(app, target)
}, 1000 / 90)
