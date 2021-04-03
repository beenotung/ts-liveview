import JSX from './jsx.js'

let name = 'Alice'

let root = (
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

console.log('demo:', root)
