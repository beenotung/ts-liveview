import { LayoutType, title } from '../../config.js'
import { renderError } from '../components/error.js'
import { IonBackButton } from '../components/ion-back-button.js'
import type { DynamicContext } from '../context'
import { o } from '../jsx/jsx.js'
import type { Routes } from '../routes'

type Character = {
  id: number
  name: string
  desc: string
}
export let characters: Character[] = []

// reference: https://en.wikipedia.org/wiki/Alice_and_Bob
characters.push({
  id: 1,
  name: 'Alice and Bob',
  desc: 'The original, generic characters. Generally, Alice and Bob want to exchange a message or cryptographic key.',
})
characters.push({
  id: 2,
  name: 'Carol, Carlos or Charlie',
  desc: 'A generic third participant.',
})
characters.push({
  id: 3,
  name: 'Chuck or Chad',
  desc: 'A third participant, usually of malicious intent.',
})
characters.push({
  id: 4,
  name: 'Craig',
  desc: 'A password cracker, often encountered in situations with stored passwords.',
})
characters.push({
  id: 5,
  name: 'Dan, Dave or David',
  desc: 'A generic fourth participant. ',
})
characters.push({
  id: 6,
  name: 'Erin',
  desc: 'A generic fifth participant, but rarely used, as "E" is usually reserved for Eve.',
})
characters.push({
  id: 7,
  name: 'Eve or Yves',
  desc: 'An eavesdropper, who is usually a passive attacker. While they can listen in on messages between Alice and Bob, they cannot modify them. In quantum cryptography, Eve may also represent the environment.',
})
characters.push({
  id: 8,
  name: 'Faythe',
  desc: 'A trusted advisor, courier or intermediary. Faythe is used infrequently, and is associated with faith and faithfulness. Faythe may be a repository of key service or courier of shared secrets.',
})
characters.push({
  id: 9,
  name: 'Frank',
  desc: 'A generic sixth participant.',
})
characters.push({
  id: 10,
  name: 'Grace',
  desc: 'A government representative. For example, Grace may try to force Alice or Bob to implement backdoors in their protocols. Grace may also deliberately weaken standards.',
})

function DetailPage(attrs: { item: Character }, context: DynamicContext) {
  let { item } = attrs
  return (
    <>
      <ion-header>
        <ion-toolbar role="heading" aria-level="1">
          <IonBackButton
            href="/app/home"
            buttonsSlot="start"
            color="primary"
            backText="List"
          />
          <ion-title>{item.name}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>Detail of item: {item.name}</p>
        <p>{item.desc}</p>
        <div>
          Reference:{' '}
          <a
            href="https://en.wikipedia.org/wiki/Alice_and_Bob#Cast_of_characters"
            target="_blank"
          >
            wikipedia.org
          </a>
        </div>
      </ion-content>
    </>
  )
}

let routes = {
  '/app/characters/:id': {
    layout_type: LayoutType.ionic,
    resolve(context) {
      let id = context.routerMatch?.params.id
      let item = characters.find(item => item.id == id)
      if (!item) {
        return {
          title: title('Character not found'),
          description: 'Character by not found by id',
          node: renderError('Character not found, id: ' + id, context),
        }
      }
      return {
        title: title('Details of ' + item.name),
        description:
          'Cast of characters for ' +
          item.name +
          ' as placeholders in discussion about cryptographic systems and protocols',
        node: DetailPage({ item }, context),
      }
    },
  },
} satisfies Routes

export default { routes }
