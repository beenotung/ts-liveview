import { NodeList, attrs } from '../jsx/types.js'
import { mapArray } from './fragment.js'

/**
 * @description turn multi-line text into multiple `<p>` elements, and turn single newline into `<br>`.
 * - The spaces in each lines are trimmed.
 * - Two continuous newlines indicate new paragraph.
 *
 * @example
   ```
   <section>
     {ParagraphList(`
      This is the first sentence of the first paragraph.
      This is still in the first paragraph.

      This is in the second paragraph.
     `)}
   </section>
   ```

   Is converted into:
   ```
   <section>
     <p>
       This is the first sentence of the first paragraph.
       <br>
       This is still in the first paragraph.
      </p>
      <p>This is in the second paragraph.</p>
   </section>
   ```
 */
export function ParagraphList(text: string, attrs?: attrs) {
  let nodes: NodeList = []
  text = text
    .split('\n')
    .map(line => line.trim())
    .join('\n')
  for (let part of text.split('\n\n')) {
    part = part.trim()
    if (!part) continue
    nodes.push(['p', attrs, [mapArray(part.split('\n'), part => part, ['br'])]])
  }
  return [nodes]
}
