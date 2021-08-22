import JSX from '../jsx/jsx.js'
import { getContext } from '../context.js'
import { attrs } from '../jsx/types.js'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { Update } from '../components/update.js'
import 'fastest-levenshtein'
import { distance } from 'fastest-levenshtein'

const wordSet = new Set<string>()
const dictDir = '/usr/share/dict'
if (existsSync(dictDir)) {
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
if (wordSet.size === 0) {
  let pkg = JSON.parse(readFileSync('package.json').toString())
  ;[Object.keys(pkg.dependencies), Object.keys(pkg.devDependencies)].forEach(
    list => list.forEach(word => wordSet.add(word)),
  )
}
const words = Array.from(wordSet)

const TopN = 20

export function AutoCompleteDemo(attrs: attrs) {
  const context = getContext(attrs)
  if (context.type === 'ws') {
    const input = new URLSearchParams(context.routerMatch!.search).get('input')
    if (input) {
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
  }
  return (
    <div id="auto-complete-demo">
      <h2>Auto-complete Demo</h2>
      <p>
        This page demo how to implement server-filtered auto-complete input
        field.
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
        To avoid freezing the UI. When there exists more than {TopN} matches,
        the server will only send top {TopN} matches (with lowest{' '}
        <a href="https://www.npmjs.com/package/fastest-levenshtein">
          edit distance
        </a>
        ) to the browser.
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
    </div>
  )
}

export default AutoCompleteDemo
