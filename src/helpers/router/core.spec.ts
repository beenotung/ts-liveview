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
  router.add('/users/:user_id', 'profile page')
  let context = router.route('/users/123')!
  expect(context).toBeDefined()
  expect(context.value).toBe('profile page')
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

it('should handle mixed routes w/wo params', function() {
  router.add('/', 'home page')
  router.add('/posts', 'post list')
  router.add('/posts/:pid', 'post page')
  router.add('/posts/:pid/page/:p', 'post n page')

  expect(router.route('/')!.value).toEqual('home page')

  expect(router.route('/posts')!.value).toEqual('post list')

  expect(router.route('/posts/123')!.value).toEqual('post page')
  expect(router.route('/posts/123')!.params).toEqual({ pid: '123' })

  expect(router.route('/posts/123/page/42')!.value).toEqual('post n page')
  expect(router.route('/posts/123/page/42')!.params).toEqual({ pid: '123', p: '42' })
})

it('should handle routes with query', function() {
  router.add('/post', 'post page')
  router.add('/', 'home page')

  let match = router.route('/post?lang=en')!
  expect(match).toBeDefined()
  expect(match.query).toEqual({ lang: 'en' })
  expect(match.value).toBe('post page')

  match = router.route('/?lang=en')!
  expect(match).toBeDefined()
  expect(match.query).toEqual({ lang: 'en' })
  expect(match.value).toBe('home page')
})
