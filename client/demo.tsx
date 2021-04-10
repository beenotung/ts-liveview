import JSX from './jsx.js'

let name = 'Alice'

let jsxVNode = (
  <div id="cat-123" className="cat alive" class="animal">
    Hello {name}
    <div className="row">
      <div className="col">cell 1</div>
      <div className="col">cell 2</div>
    </div>
    <div>no attr</div>
    <div className="space"></div>
    <span></span>
  </div>
)

let compactVNode = [
  'div#cat-123.cat.alive.animal',
  [],
  [
    'Hello ',
    name,
    [
      'div.row',
      [],
      [
        ['div.col', [], 'cell 1'],
        ['div.col', [], 'cell 2'],
      ],
    ],
    ['div', [], ['no attr']],
    ['div.space'],
    ['span'],
  ],
]

console.log('demo')
console.log({ jsxVNode, compactVNode })
let size = {
  jsxVNode: JSON.stringify(jsxVNode).length,
  compactVNode: JSON.stringify(compactVNode).length,
}
console.log('size:', size)
let savedPercentage =
  ((size.jsxVNode - size.compactVNode) / size.jsxVNode) * 100
console.log('saved:', savedPercentage.toFixed(2) + '%')
