import { Router } from './core'
import { expect } from 'chai'

describe('router core TestSuit', () => {
  let router: Router<any>

  function get(path: string) {
    return router.route(path)?.value
  }

  beforeEach(() => {
    router = new Router<any>()
  })

  it('should handle 404', function () {
    expect(get('/404')).undefined
  })

  it('should handle root route', function () {
    router.add('/', 'home')
    expect(get('/')).equals('home')
  })

  it('should handle multiple direct match routes', function () {
    router.add('/', 'home page')
    router.add('/profile', 'profile page')
    router.add('/settings', 'setting page')
    expect(get('/')).equals('home page')
    expect(get('/profile')).equals('profile page')
    expect(get('/settings')).equals('setting page')
    expect(get('/404')).undefined
  })

  it('should handle multiple level of direct match route', function () {
    router.add('/', 'home')
    router.add('/users', 'user list')
    router.add('/users/1', 'profile page')
    router.add('/users/1/friends', 'friend list')

    expect(get('/')).equals('home')
    expect(get('/users')).equals('user list')
    expect(get('/users/1')).equals('profile page')
    expect(get('/users/1/friends')).equals('friend list')
  })

  it('should handle single route with params', function () {
    router.add('/users/:user_id', 'profile page')
    let context = router.route('/users/123')!
    expect(context).not.undefined
    expect(context.value).equals('profile page')
    expect(context.params).deep.equals({ user_id: '123' })
  })

  it('should handle single route with multiple params', function () {
    router.add('/users/:uid/friends/:fid', 'friend')
    let context = router.route('/users/123/friends/456')!
    expect(context).not.undefined
    expect(context.value).equals('friend')
    expect(context.params).deep.equals({ uid: '123', fid: '456' })
  })

  it('should handle multiple routes with params', function () {
    router.add('/user/:pid/profile', 'p')
    router.add('/user/:uid/friends', 'f')
    router.add('/user/self/noodles', 'n')

    expect(router.route('/user/1/profile')!.value).equals('p')
    expect(router.route('/user/1/profile')!.params).deep.equals({ pid: '1' })

    expect(router.route('/user/2/friends')!.value).equals('f')
    expect(router.route('/user/2/friends')!.params).deep.equals({ uid: '2' })

    expect(router.route('/user/self/noodles')!.value).equals('n')
  })

  it('should handle mixed routes w/wo params', function () {
    router.add('/', 'home page')
    router.add('/posts', 'post list')
    router.add('/posts/:pid', 'post page')
    router.add('/posts/:pid/page/:p', 'post n page')

    expect(router.route('/')!.value).equals('home page')

    expect(router.route('/posts')!.value).equals('post list')

    expect(router.route('/posts/123')!.value).equals('post page')
    expect(router.route('/posts/123')!.params).deep.equals({ pid: '123' })

    expect(router.route('/posts/123/page/42')!.value).equals('post n page')
    expect(router.route('/posts/123/page/42')!.params).deep.equals({
      pid: '123',
      p: '42',
    })
  })

  it('should handle routes with query', function () {
    router.add('/post', 'post page')
    router.add('/', 'home page')

    let match = router.route('/post?lang=en')!
    expect(match).not.undefined
    expect(match.query).deep.equals({ lang: 'en' })
    expect(match.value).equals('post page')

    match = router.route('/?lang=en')!
    expect(match).not.undefined
    expect(match.query).deep.equals({ lang: 'en' })
    expect(match.value).equals('home page')
  })
})
