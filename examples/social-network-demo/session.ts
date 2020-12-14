import debug from 'debug'
import { Session } from 'ts-liveview'
import type { ViewRouter } from 'ts-liveview'
import { Primus } from 'typestub-primus'

const log = debug('session.ts')

// log.enabled = true

export function attachPrimus(primus: Primus, router: ViewRouter) {
  primus.on('connection', spark => {
    log('connection', spark.id)
    const session = new Session(spark)
    spark.on('end', () => {
      log('disconnect', spark.id)
    })
    spark.on('data', data => {
      if (!Array.isArray(data)) {
        log('unknown data from ws:', data)
        return
      }
      log('data', data)
      switch (data[0]) {
        case 'url':
          return route(data[1])
      }
    })

    function route(url: string) {
      router.dispatch(url, {
        type: 'liveview',
        session,
        next: (...args: any[]) => {
          log('unknown route:', args)
        },
      })
    }
  })
}
