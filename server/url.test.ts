import { expect } from 'chai'
import { toUrl } from './url.js'

describe('toUrl', () => {
  describe('preserve option', () => {
    let chars = '@:,=[]()'

    it('should not be lossy', () => {
      let result = toUrl('https://example.com/test', {
        query: { chars },
        preserve: true,
      })
      let url = new URL(result)
      expect(url.searchParams.get('chars')).to.equals(chars)
    })

    it('should preserve symbols by default', () => {
      let result = toUrl('/test', {
        query: { chars },
      })
      expect(result).to.equals(`/test?chars=${chars}`)
    })

    it('should preserve symbols if explicitly set as true', () => {
      let result = toUrl('/test', {
        query: { chars },
        preserve: true,
      })
      expect(result).to.equals(`/test?chars=${chars}`)
    })

    it('should encode symbols if explicitly set as false', () => {
      let result = toUrl('/test', {
        query: { chars },
        preserve: false,
      })
      expect(result).to.equals(
        `/test?${new URLSearchParams({ chars }).toString()}`,
      )
    })
  })
})
