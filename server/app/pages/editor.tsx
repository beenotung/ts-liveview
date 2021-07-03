import JSX from '../jsx/jsx.js'
import type { attrs, Node } from '../jsx/types'
import { getContext } from '../context.js'
import { ManagedWebsocket } from '../../ws/wss.js'
import { EarlyTerminate } from '../helpers.js'
import { ServerMessage } from '../../../client'
import { onWsSessionClose } from '../session.js'

type State = {
  width: number
  color: string
}
const DefaultState: State = { width: 150, color: 'white' }
const sessions = new WeakMap<ManagedWebsocket, State>()
const Colors = ['white', 'black', 'blue']
export function Editor(attrs: attrs) {
  const context = getContext(attrs)
  function getState(): State {
    if (context.type === 'static') return { ...DefaultState }
    if (context.type === 'express') {
      let query = context.req.query
      return { ...DefaultState, ...query }
    }
    let ws = context.ws
    let state = sessions.get(ws)
    if (!state) {
      state = { ...DefaultState }
      sessions.set(ws, state)
      onWsSessionClose(ws, () => sessions.delete(ws))
    }
    let messages: ServerMessage[] = []
    let params = new URLSearchParams(context.routerMatch!.search)
    let width = +params.get('width')!
    if (width) {
      state.width = width
      messages.push(
        ['update-in', '#image-editor #output-width', width],
        ['update-props', '#image-editor #output-image', { width }],
      )
    }
    let color = params.get('color')
    if (color) {
      state.color = color
      messages.push([
        'update-attrs',
        '#image-editor #output-image',
        { style: `background-color: ${state.color}` },
      ])
    }
    Colors.forEach(color =>
      messages.push([
        'update-props',
        `#image-editor #image-color_${color}`,
        { checked: color === state!.color },
      ]),
    )
    if (messages.length > 0) {
      ws.send(['batch', messages])
      throw EarlyTerminate
    }
    return state
  }
  let state = getState()
  return (
    <div id="image-editor">
      <h2>Image Editor Demo</h2>
      <p>
        This demo illustrate how low-latency can it be even when the state and
        logic are maintained on the server.
      </p>
      <input
        id="image-width"
        title="control image width"
        type="range"
        oninput="emit('/editor?width='+this.value)"
        min="100"
        max="500"
        value={state.width}
      />
      <label for="image-width">
        <span id="output-width">{state.width}</span>px
      </label>
      <div>
        {[
          Colors.map(color => {
            let id = `image-color_${color}`
            let attrs: attrs = {}
            if (state.color === color) {
              attrs.checked = 'checked'
            }
            return (
              <div style="display: inline-block">
                <input
                  type="radio"
                  id={id}
                  value={color}
                  {...attrs}
                  onchange="emit('/editor?color='+this.value)"
                />
                <label for={id}>{color}</label>
              </div>
            )
          }),
        ]}
      </div>
      <img
        alt="output image from editor"
        id="output-image"
        width={state.width}
        style={`background-color: ${state.color}`}
        src="https://avatars0.githubusercontent.com/u/6510388"
      />
      <hr />
      <p>
        Reference:{' '}
        <a href="https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript">
          Phoenix LiveView: Interactive, Real-Time Apps. No Need to Write
          JavaScript. - DockYard
        </a>
      </p>
      <div>Screencast from the blog:</div>
      <img
        src="https://i.imgur.com/DYIv3ut.gif"
        alt="original image editor demo with Phoenix LiveView"
      />
    </div>
  )
}
export default { index: Editor }
