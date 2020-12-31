import { allNames } from '@beenotung/tslib/constant/character-name'
import SArray from 's-array'
import S from "s-js";

export interface Comment {
  from: User
  to: User
  content: string
}

export class User {
  madeComments = SArray<Comment>([])
  receivedComments = SArray<Comment>([])

  constructor(public name: string) {}

  sendComment(to: string, content: string) {
    const receiver: User = S.sample(users).find(user => user.name === to)
    if (!receiver) {
      console.error('receiver', to, 'not found')
      return
    }
    const comment: Comment = {
      from: this,
      to: receiver,
      content,
    }
    this.madeComments.push(comment)
    receiver.receivedComments.push(comment)
  }
}

export let users: SArray<User> = S.root(() =>
  SArray(allNames.map(name => new User(name))),
)
