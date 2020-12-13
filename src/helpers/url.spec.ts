import { expect } from 'chai'
import { parseHash } from './url'

describe('url TestSuit', function() {
  it('should getHash from url', function() {
    expect(parseHash('/#/rainbow')).to.equals('#/rainbow')
  })
})
