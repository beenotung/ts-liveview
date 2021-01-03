import { allNames } from '@beenotung/tslib/constant/character-name'
import { new_counter } from '@beenotung/tslib/uuid'
import SArray, { SDataArray } from 's-array'
import S from 's-js'

export interface Comment {
  id: number
  from: User
  to: User
  content: string
}

export namespace Comment {
  export let ids = new_counter()
}

export class User {
  static ids = new_counter()
  madeComments = SArray<Comment>([])
  receivedComments = SArray<Comment>([])

  constructor(
    public name: string,
    public id: string = User.ids.next().toString(),
  ) {}

  sendComment(to: string, content: string) {
    const receiver = S.sample(users).find(user => user.name === to)
    if (!receiver) {
      console.error('receiver', to, 'not found')
      return
    }
    const comment: Comment = {
      id: Comment.ids.next(),
      from: this,
      to: receiver,
      content,
    }
    this.madeComments.push(comment)
    receiver.receivedComments.push(comment)
    comments.push(comment)
  }
}

export function newUsername() {
  const idx = Math.floor(Math.random() * allNames.length)
  const name = allNames[idx]
  const usernames = new Set(S.sample(users).map(user => user.name))
  for (let i = 1; ; i++) {
    const username = name + i
    if (!usernames.has(username)) {
      return username
    }
  }
}

export function newUser() {
  const user = new User(newUsername())
  users.push(user)
  return user
}

export let users: SDataArray<User>
export let comments: SDataArray<Comment>

S.root(dispose => {
  users = SArray([])
  comments = SArray([])
  dispose()
})
