import { expect } from 'chai'
import { minifyHTML } from './html'

describe('minify TestSuit', () => {
  it('should remove comments', function () {
    expect(minifyHTML(`<body>123<!-- I am a comment --></body>`)).equals(
      `<body>123</body>`,
    )
  })
  it('should remove whitespaces', function () {
    expect(
      minifyHTML(
        `<body>
<style>
  body {
    background-color: wheat;
  }
</style>
<script>
  function add ( a , b ) {
    return a + b;
  }
  let a = 1;
  let b = 1;
  let c = add(a, b);
</script>
</body>`,
      ),
    ).to.equals(
      `<body>
<style>
body{background-color:wheat;}
</style>
<script>
function add(a,b){return a + b;}
let a=1;let b=1;let c=add(a,b);</script>
</body>`,
    )
  })
})
