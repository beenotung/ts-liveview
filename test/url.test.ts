import { parseHash } from '../src/helpers/url'

describe('url TestSuit', function () {
  it('should getHash from url', function () {
    expect(parseHash('/#/rainbow')).toEqual('#/rainbow')
  })
})
