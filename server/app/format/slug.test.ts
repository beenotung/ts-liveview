import { toSlug } from './slug.js'
import { expect } from 'chai'

describe('toSlug', () => {
  it('should convert a string to a slug', () => {
    expect(toSlug('Hello World')).to.equal('hello-world')
  })
})
