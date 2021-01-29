import morphdom from 'morphdom'

const app = document.createElement('div')
document.body.appendChild(app)
const items: any[] = []

function randomValue() {
  return Math.floor(Math.random() * 10)
}

items.push(randomValue())

function mutateArray(items: any[]) {
  const idx = Math.floor(Math.random() * items.length)
  const item = items[idx]
  const value = Math.random() < 0.9 ? randomValue() : [randomValue()]
  if (Array.isArray(item)) {
    if (Math.random() < 0.5) {
      mutateArray(item)
    } else {
      item.push(value)
    }
  } else {
    if (Math.random() < 0.5) {
      items[idx] = value
    } else {
      items.push(value)
    }
  }
}

const colors = new Map()
const cs = ['red', 'green', 'blue']

function getColor(items: any[]) {
  if (colors.has(items)) {
    return colors.get(items)
  }
  const c = cs[Math.floor(Math.random() * cs.length)]
  colors.set(items, c)
  return c
}

function renderArray(items: any[]): string {
  const color = getColor(items)
  const content = items
    .map(x => `${Array.isArray(x) ? renderArray(x) : x}`)
    .join('')
  return `<span style="color: ${color}; word-wrap: break-word">${content}</span>`
}

setInterval(() => {
  mutateArray(items)

  const target = `<div>
now is: <span>${Date.now()}</span>
<br>
${new Date().toLocaleString()}
${renderArray(items)}
</div>`
  morphdom(app, target)
}, 1000 / 90)
