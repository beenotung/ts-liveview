import type {
  Node,
  Raw,
  Fragment,
  JSXFragment,
  Component,
  Element,
} from './types'
import type { HTMLStream } from './stream'
import { getContextLanguage, Context } from '../context.js'
import { writeNode } from './html.js'
import { expect } from 'chai'
import { mapArray } from '../components/fragment.js'

describe('writeNode', () => {
  let context!: Context
  let stream!: HTMLStream
  let output!: string
  beforeEach(() => {
    context = { type: 'static', language: 'en' }
    output = ''
    stream = {
      write(chunk) {
        output += chunk
      },
      flush() {},
    }
  })

  function test<T extends Node>(
    type: string,
    node: T,
    html: string,
    error_or_flag?: Error | 'skip',
  ) {
    let skip = error_or_flag === 'skip'
    let error = error_or_flag instanceof Error ? error_or_flag : undefined
    let t = skip ? it.skip : it
    t(`should serialize ${type} to HTML`, () => {
      let log = console.error
      if (error) {
        console.error = () => {}
      }

      writeNode(stream, node, context)

      if (error) {
        console.error = log
      }

      expect(minifyHTML(output)).to.equal(minifyHTML(html))
    })
  }

  describe('Literal', () => {
    test<string>('string', 'apple', 'apple')
    test<number>('number', 42, '42')
    test<null>('null', null, '')
    test<undefined>('undefined', undefined, '')
    test<false>('false', false, '')
    test<true>('true', true, '')
  })

  describe('Raw', () => {
    let script = /* html */ `<script>alert("hello")</script>`
    let style = /* html */ `<style>body { background-color: red; }</style>`
    let html = /* html */ `<div style="font-weight: bold;">Hello, world!</div>`
    let json = /* html */ `{"id": 123, "name": "John"}`

    test<Raw>('script', ['raw', script], script)
    test<Raw>('style', ['raw', style], style)
    test<Raw>('html', ['raw', html], html)
    test<Raw>('json', ['raw', json], json)
  })

  describe('Fragment', () => {
    test<Fragment>('empty', [[]], '')
    test<Fragment>('1 element', [['apple']], 'apple')
    test<Fragment>('2 elements', [['pine', 'apple']], 'pineapple')
    test<Fragment>(
      '3 elements',
      [['pine', 'apple', ' juice']],
      'pineapple juice',
    )
    test<Fragment>(
      '3+ elements',
      [['pine', 'apple', ' juice', ' bottle']],
      'pineapple juice bottle',
    )
  })

  describe('JSXFragment', () => {
    test<JSXFragment>('empty', [undefined, null, []], '')
    test<JSXFragment>('1 element', [undefined, null, ['apple']], 'apple')
    test<JSXFragment>(
      '2 elements',
      [undefined, null, ['pine', 'apple']],
      'pineapple',
    )
    test<JSXFragment>(
      '3 elements',
      [undefined, null, ['pine', 'apple', ' juice']],
      'pineapple juice',
    )
    test<JSXFragment>(
      '3+ elements',
      [undefined, null, ['pine', 'apple', ' juice', ' bottle']],
      'pineapple juice bottle',
    )
  })

  describe('Component', () => {
    function Component_no_attr(): Node {
      return ['div', {}, ['Hello, world!']]
    }

    function Component_with_attr(attrs: { name?: string }): Node {
      return ['div', {}, [`Hello, ${attrs.name}!`]]
    }

    function Component_with_context(attrs: {}, context: Context): Node {
      let lang = getContextLanguage(context)
      return ['div', {}, [`language: ${lang}`]]
    }

    test<Component>(
      'no attrs',
      [Component_no_attr],
      /* html */ `<div>Hello, world!</div>`,
    )

    test<Component<object>>(
      'with attrs',
      [Component_with_attr, { name: 'Alice' }],
      /* html */ `<div>Hello, Alice!</div>`,
    )

    test<Component<object>>(
      'with context',
      [Component_with_context],
      /* html */ `<div>language: en</div>`,
    )
  })

  describe('Element', () => {
    test<Element>(
      'with attrs and children',
      [
        'ul#popularList.article-list',
        { style: 'padding: 0; margin: 0; list-style: none;' },
        [
          [
            'li',
            { class: 'article-item' },
            [['span.article-title', undefined, ['Article 1']]],
          ],
          [
            'li',
            { class: 'article-item' },
            [['span.article-title', undefined, ['Article 2']]],
          ],
          [
            'li',
            { class: 'article-item' },
            [['span.article-title', undefined, ['Article 3']]],
          ],
        ],
      ],
      /* html */ `
    <ul id="popularList" class="article-list" style="padding: 0; margin: 0; list-style: none;">
      <li class="article-item">
        <span class="article-title">Article 1</span>
      </li>
      <li class="article-item">
        <span class="article-title">Article 2</span>
      </li>
      <li class="article-item">
        <span class="article-title">Article 3</span>
      </li>
    </ul>`,
    )

    test<Element>(
      'with attrs, no children',
      ['h1.article-title', { style: 'text-align: center' }],
      /* html */ `<h1 class="article-title" style="text-align: center"></h1>`,
    )

    test<Element>(
      'without attrs nor children',
      ['h1.article-title'],
      /* html */ `<h1 class="article-title"></h1>`,
    )

    test<Element>(
      'with [name=value] syntax in selector',
      [
        'section#mainSection.highlight[data-id="12"',
        { style: 'text-align: center' },
      ],
      /* html */ `<section id="mainSection" class="highlight" data-id="12" style="text-align: center"></section>`,
      'skip',
    )
  })

  describe('NodeList (fallback)', () => {
    function testArray(
      name: string,
      array: Node[],
      args: {
        mapArray: string
        arrayMap: string
      },
    ) {
      describe(name, () => {
        test(
          'using mapArray',
          mapArray(array, item => item),
          args.mapArray,
        )
        test(
          'using array.map',
          // @ts-expect-error
          array.map(item => item),
          args.arrayMap,
        )
      })
    }

    testArray('empty array', [], {
      mapArray: '',
      arrayMap: '',
    })

    testArray('1-element string array (conflict with Element)', ['apple'], {
      mapArray: 'apple',
      // NodeList in this case will be recognized as Element expression
      arrayMap: '<apple></apple>',
    })

    testArray('2-elements string array', ['pine', 'apple'], {
      mapArray: 'pineapple',
      // NodeList in this case can be recognized, since the tuple[1] of Element won't be string
      arrayMap: 'pineapple',
    })

    testArray('1-element number array', [12], {
      mapArray: '12',
      // NodeList in this case will be recognized, since the tuple[0] of Element must be string
      arrayMap: '12',
    })

    testArray('2-elements number array', [12, 34], {
      mapArray: '1234',
      // NodeList in this case will be recognized
      arrayMap: '1234',
    })

    describe('mixed array type', () => {
      testArray(
        'attrs cannot be null - distinguish with Element',
        ['apple', null],
        {
          // null will not be rendered
          mapArray: 'apple',
          // attrs must be {} or undefined, not null, so it will not be recognized as Element expression
          arrayMap: 'apple',
        },
      )

      testArray(
        'attrs can be undefined - conflict with Element',
        ['apple', undefined],
        {
          // undefined will not be rendered
          mapArray: 'apple',
          // attrs can be undefined, so it will be recognized as Element expression
          arrayMap: '<apple></apple>',
        },
      )

      // mapArray should not return {} object
      let element_with_attr = ['pine', { class: 'fruit' }] satisfies Element
      // @ts-expect-error
      mapArray(element_with_attr, item => item)

      // mapArray should not return string[]
      let element_without_attr = [
        'pine',
        undefined,
        ['apple'],
      ] satisfies Element
      // @ts-expect-error
      mapArray(element_without_attr, item => item)
    })
  })

  describe('Unexpected Object', () => {
    function testError(type: string, value: object | symbol, message: string) {
      test(
        type,
        // @ts-expect-error
        ['div', {}, [value]],
        /* html */ `<div><p class="error">TypeError: unexpected node type: [${message}]</p></div>`,
        new TypeError(`unexpected node type: [${message}]`),
      )
    }

    // Custom Classes
    class Animal {}
    class Cat extends Animal {}

    testError('Date', new Date(), 'object Date')
    testError('Map', new Map(), 'object Map')
    testError('Set', new Set(), 'object Set')

    testError('plain object', { id: 1, username: 'alice' }, 'object Object')
    testError('class object', new Object(), 'object Object')
    testError('empty object', Object.create(null), 'object Object')

    testError('function', () => () => {}, 'object Function')

    testError('symbol', Symbol.for('apple'), 'object Symbol')

    testError('custom class object', new Animal(), 'object Animal')
    testError('custom class object with inheritance', new Cat(), 'object Cat')
  })
})

function minifyHTML(html: string) {
  let output = ''
  let lines = html.split('\n')
  for (let line of lines) {
    output += line.trim()
  }
  return output
}
