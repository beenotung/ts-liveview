template_import="
"
template_main="
let page = (
  <>
    {style}
    <div id='$name'>
      <h1>{pageTitle}</h1>
      <Main/>
    </div>
  </>
)

function Main(attrs: {}, context: Context) {
  let items = [1, 2, 3]
  return (
    <ul>
      {mapArray(items, item => (
        <li>item {item}</li>
      ))}
    </ul>
  )
}
"
