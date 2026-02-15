import { markdownToHtml } from './markdown.js'
import { expect } from 'chai'

describe('markdownToHtml', () => {
  it('should convert markdown to html', () => {
    expect(markdownToHtml('# Hello World').toString().trim()).to.equal(
      '<h1>Hello World</h1>',
    )
  })
})
