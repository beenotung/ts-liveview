import { expect } from 'chai'

export function maskEmailForHint(email: string): string {
  let [username, domain] = email.split('@')
  let length = username.length
  if (length == 0 || length == 1) {
    return domain
  }
  if (length < 4) {
    return username.slice(0, 1) + 'x'.repeat(username.length - 1) + '@' + domain
  }
  if (length < 8) {
    return (
      username.slice(0, 1) +
      'x'.repeat(username.length - 2) +
      username.slice(-1) +
      '@' +
      domain
    )
  }
  return (
    username.slice(0, 2) +
    'x'.repeat(username.length - 4) +
    username.slice(-2) +
    '@' +
    domain
  )
}

function test() {
  expect(maskEmailForHint('a@gmail.com')).to.equals('gmail.com')
  expect(maskEmailForHint('ab@gmail.com')).to.equals('ax@gmail.com')
  expect(maskEmailForHint('abc@gmail.com')).to.equals('axx@gmail.com')
  expect(maskEmailForHint('abcd@gmail.com')).to.equals('axxd@gmail.com')
  expect(maskEmailForHint('abcde@gmail.com')).to.equals('axxxe@gmail.com')
  expect(maskEmailForHint('abcdef@gmail.com')).to.equals('axxxxf@gmail.com')
  expect(maskEmailForHint('abcdefgh@gmail.com')).to.equals('abxxxxgh@gmail.com')
  console.log('passed all tests in email-mask.ts')
}

if (import.meta.url == 'file://' + process.argv[1]) {
  test()
}
