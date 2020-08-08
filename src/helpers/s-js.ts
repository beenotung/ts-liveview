import S from 's-js'

export function sampleInSRoot<T>(f: () => T): T {
  return S.root(dispose => {
    const result = S.sample(() => f())
    dispose()
    return result
  })
}
