import debug from 'debug'
import S from 's-js'
import type { ViewRouter } from 'ts-liveview'
import { SLiveSession } from 'ts-liveview'
import { ISpark, Primus } from 'typestub-primus'
import { newUser, User } from './store'

const log = debug('session.ts')
log.enabled = true

export class AppSession extends SLiveSession {
  url = S.data('init')
  user: User
  cookies: URLSearchParams
  msgText = S.data('')

  constructor(spark: ISpark, router: ViewRouter<AppSession>) {
    super(spark)
    log('connection', spark.id)
    this.cookies = new URLSearchParams(spark.request.headers.cookie)
    // log('cookies', this.cookies)
    this.user = userFromSession(this.cookies.get(SessionKey)!)
    this.onClose(() => {
      log('disconnect', spark.id)
    })
    this.onMessage(args => {
      switch (args[0]) {
        case 'url':
          log('url:', args[1])
          this.url(args[1])
          break
        case 'msgText':
          this.msgText(args[1])
          break
        default:
          log('unknown message:', args)
      }
    })
    S(() => {
      const url = this.url()
      if (url === 'init') {
        return
      }
      router.dispatch(url, {
        type: 'liveview',
        session: this,
        next: () => {
          log('404:', url)
        },
      })
    })
  }
}

export function attachSession(primus: Primus, router: ViewRouter<AppSession>) {
  primus.on('connection', spark => {
    SLiveSession.spawnFromRoot(() => new AppSession(spark, router))
  })
}

export let SessionKey = 'sid'

const sessionUsers: Record<string, User> = {}

export function userFromSession(sid: string): User {
  if (sid in sessionUsers) {
    return sessionUsers[sid]
  }
  const user = newUser()
  sessionUsers[sid] = user
  return user
}
