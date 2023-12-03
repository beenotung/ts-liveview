import { o } from '../jsx/jsx.js'
import type { attrs } from '../jsx/types'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { Update } from '../components/update.js'
import { distance } from 'fastest-levenshtein'
import SourceCode from '../components/source-code.js'
import { getContextSearchParams } from '../routes.js'
import type { Context } from '../context'

const wordSet = new Set<string>()
const dictDir = '/usr/share/dict'
if (existsSync(dictDir)) {
  loadWordsFromDir()
}
if (wordSet.size === 0) {
  loadWordsFromPackage()
}

function loadWordsFromDir() {
  readdirSync(dictDir).forEach(file => {
    file = join(dictDir, file)
    readFileSync(file)
      .toString()
      .split('\n')
      .forEach(line => {
        line = line.trim()
        if (line) {
          wordSet.add(line)
        }
      })
  })
}

function loadWordsFromPackage() {
  readFileSync('package.json')
    .toString()
    .match(/"(.*?)"/g)
    ?.map(s => s.slice(1, -1)) // remove double quotes
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .filter(s => !(+s.at(-1)! + 1)) // skip package versions
    .filter(s => !s.includes('.com')) // skip email address
    .forEach(s => wordSet.add(s))
}

const words = Array.from(wordSet)

const TopN = 20

let content = (
  <div id="auto-complete-demo">
    <h1>Auto-complete Demo</h1>
    <p>
      This page demo how to implement server-filtered auto-complete input field.
    </p>
    <p>
      The server holds a list of {words.length.toLocaleString()} dictionary
      words.
    </p>
    <p>
      When the user input some text, the server filter the list by running:{' '}
      <code>{`words.filter(word => word.includes(input))`}</code>
    </p>
    <p>
      To avoid freezing the UI. When there exists more than {TopN} matches, the
      server will only send top {TopN} matches (with lowest{' '}
      <a href="https://www.npmjs.com/package/fastest-levenshtein">
        edit distance
      </a>
      ) to the browser.
    </p>
    <p>
      It all happens on the server so the client does not need to download
      additional libraries.
    </p>
    <fieldset style="display: inline-block">
      <legend>Demo</legend>
      <p>
        Total number of matches:{' '}
        <span id="num-matches">
          (Input at least one character to get auto-complete list)
        </span>
      </p>
      <label for="input-package">Try to input an English word: </label>
      <input
        id="input-package"
        list="package-list"
        oninput="emit('/auto-complete?input='+this.value)"
        placeholder="e.g. apple"
      />
      <datalist id="package-list"></datalist>
    </fieldset>
    <SourceCode page="auto-complete-demo.tsx" />
  </div>
)

function renderUpdate(input: string) {
  const allMatches = words.filter(word => word.includes(input))
  const topMatches = allMatches
    .map(word => [word, distance(word, input)] as const)
    .sort((a, b) => a[1] - b[1])
    .slice(0, TopN)
  return (
    <Update
      to="/auto-complete"
      message={[
        'batch',
        [
          [
            'update-in',
            '#auto-complete-demo #package-list',
            [topMatches.map(([word]) => <option value={word} />)],
          ],
          [
            'update-in',
            '#auto-complete-demo #num-matches',
            allMatches.length.toLocaleString(),
          ],
        ],
      ]}
    />
  )
}

export function AutoCompleteDemo(_attrs: attrs, context: Context) {
  if (context.type === 'ws') {
    const input = getContextSearchParams(context).get('input')
    if (input) {
      return renderUpdate(input)
    }
  }
  return content
}

export default AutoCompleteDemo
