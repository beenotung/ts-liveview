import S from 's-js'

export class GlobalSRoot {
  dispose!: () => void
  childDisposes: Array<() => void> = []

  constructor() {
    S.root(dispose => {
      this.dispose = dispose
      S.cleanup(() => {
        this.childDisposes.forEach(dispose => dispose())
      })
    })
  }

  spawn<T>(cb: () => T) {
    return S.root(dispose => {
      this.childDisposes.push(dispose)
      return cb()
    })
  }
}

export let globalSRoot = new GlobalSRoot()
