import { Router } from './core'

let router: Router<any>

function get(path: string) {
  return router.route(path)?.value
}

beforeEach(() => {
  router = new Router<any>()
})

it('should handle 404', function() {
  expect(get('/404')).not.toBeDefined()
})

it('should handle root route', function() {
  router.add('/', 'home')
  expect(get('/')).toBe('home')
})

it('should handle multiple direct match routes', function() {
  router.add('/', 'home page')
  router.add('/profile', 'profile page')
  router.add('/settings', 'setting page')
  expect(get('/')).toBe('home page')
  expect(get('/profile')).toBe('profile page')
  expect(get('/settings')).toBe('setting page')
  expect(get('/404')).not.toBeDefined()
})

it('should handle multiple level of direct match route', function() {
  router.add('/', 'home')
  router.add('/users', 'user list')
  router.add('/users/1', 'profile page')
  router.add('/users/1/friends', 'friend list')

  expect(get('/')).toBe('home')
  expect(get('/users')).toBe('user list')
  expect(get('/users/1')).toBe('profile page')
  expect(get('/users/1/friends')).toBe('friend list')
})

it('should handle single route with params', function() {
  router.add('/users/:user_id', 'profile')
  let context = router.route('/users/123')!
  expect(context).toBeDefined()
  expect(context.value).toBe('profile')
  expect(context.params).toEqual({ user_id: '123' })
})

it('should handle single route with multiple params', function() {
  router.add('/users/:uid/friends/:fid', 'friend')
  let context = router.route('/users/123/friends/456')!
  expect(context).toBeDefined()
  expect(context.value).toBe('friend')
  expect(context.params).toEqual({ uid: '123', fid: '456' })
})

it('should handle multiple routes with params', function() {
  router.add('/user/:pid/profile', 'p')
  router.add('/user/:uid/friends', 'f')
  router.add('/user/self/noodles', 'n')

  expect(router.route('/user/1/profile')!.value).toEqual('p')
  expect(router.route('/user/1/profile')!.params).toEqual({ pid: '1' })

  expect(router.route('/user/2/friends')!.value).toEqual('f')
  expect(router.route('/user/2/friends')!.params).toEqual({ uid: '2' })

  expect(router.route('/user/self/noodles')!.value).toEqual('n')
})
