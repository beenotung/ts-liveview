import { c, h } from '../../h'
import { Session } from '../../session'
import { ViewRouter } from './view-router'

let router = new ViewRouter()

router.add('/', (context, cb) => {
  cb(c('body', h`<body>
<h1>Home Page</h1>
<p>Welcome to my page</p>
<p>You're coming from ${context.url}</p>
<p>mode: ${context.type}</p>
</body>`))
})

it('should route to home page', function() {
  let session: Session = {} as any
  let sendComponent = jest.fn()
  session.sendComponent = sendComponent
  let next = jest.fn()
  router.dispatch('/', {
    type: 'liveview',
    session,
    next,
  })
  expect(next).not.toBeCalled()
  expect(sendComponent).toBeCalled()
  expect(sendComponent.mock.calls[0][0].selector).toBe('body')
})
