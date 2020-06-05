import { h, renderInner, renderToHtml } from './h'

/// <reference path="components.d.ts"/>

// send message to server
function send(...args: any[]) {
  console.log('send', args)
}

// local interaction
function updateText(e: HTMLInputElement) {
  document.querySelector('#output')!.textContent = e.value
}

Object.assign(window, {
  send,
  updateText,
})

// TODO allow calling function onEvent easier without type cast

const main = (props: { title: string, text: string }) =>
  <div className='main'>
    <style>
      {'.main p { color: red }'}
    </style>
    <h1>{props.title}</h1>
    <button onClick={'send(\'clicked the button\')' as any}>
      click me
    </button>
    <p>
      {props.text}
    </p>
    <input onInput={'updateText(this)' as any} placeholder='the output will be shown below'/>
    <p id='output'/>
  </div>

const e = main({
  title: '<b>bold title</b>',
  text: '<script src="https://example.com"></script>',
})
console.log(e)

console.log(renderToHtml(e))

const container = document.createElement('div')
document.body.appendChild(container)
renderInner(e, container)
