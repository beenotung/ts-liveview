import sinon from 'sinon'
import { expect } from 'chai'
import { c, h } from '../../h'
import { Session } from '../../session'
import { ViewRouter } from './view-router'

describe('view-router TestSuit', () => {
  let router = new ViewRouter()

  router.add('/', (context, cb) => {
    cb(
      c(
        'body',
        h`<body>
<h1>Home Page</h1>
<p>Welcome to my page</p>
<p>You're coming from ${context.url}</p>
<p>mode: ${context.type}</p>
</body>`,
      ),
    )
  })

  it('should route to home page', function () {
    let session: Session = {} as any
    let sendComponent = sinon.fake()
    session.sendComponent = sendComponent
    let next = sinon.fake()
    router.dispatch('/', {
      type: 'liveview',
      session,
      next,
    })
    expect(next.callCount).to.equals(0)
    expect(sendComponent.callCount).to.equals(1)
    expect(sendComponent.getCall(0).firstArg.selector).to.equals('body')
  })
})
