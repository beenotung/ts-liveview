import JSX from '../jsx/jsx.js'
import type { attrs } from '../jsx/types'
import { getContext } from '../context.js'
import { ManagedWebsocket } from '../../ws/wss.js'
import { EarlyTerminate } from '../helpers.js'
import type { ServerMessage } from '../../../client/types'
import { onWsSessionClose } from '../session.js'
import { Script } from '../components/script.js'
import Style from '../components/style.js'
import SourceCode from '../components/source-code.js'
import { getContextSearchParams } from '../routes.js'

type State = {
  width: number
  color: string
}

const DefaultState: State = { width: 150, color: 'white' }

const sessions = new WeakMap<ManagedWebsocket, State>()

const Colors = ['white', 'black', 'blue']

const style = Style(/* css */ `
#image-editor figure {
  margin: 0;
  width: min-content;
}
#image-editor figcaption {
  text-align: center;
}
`)

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
    let params = getContextSearchParams(context)
    let width = +(params.get('width') as string)
    if (width) {
      state.width = width
      messages.push(
        ['update-in', '#image-editor #output-width', width],
        ['update-props', '#image-editor #output_image', { width }],
      )
    }
    let colorParam = params.get('color')
    if (colorParam) {
      state.color = colorParam
      messages.push([
        'update-attrs',
        '#image-editor #output_image',
        { style: `background-color: ${state.color}` },
      ])
      Colors.forEach(color =>
        messages.push([
          'update-props',
          `#image-editor #image-color_${color}`,
          { checked: color === colorParam },
        ]),
      )
    }
    if (messages.length > 0) {
      ws.send(['batch', messages])
      throw EarlyTerminate
    }
    return state
  }
  let state = getState()
  return (
    <div id="image-editor">
      {style}
      <h2>Image Editor Demo</h2>
      <p>
        This demo illustrates how low-latency can it be even when the state and
        logic are maintained on the server.
      </p>
      <p>
        The state of image size is managed per-connection (not globally shared).
      </p>
      <form>
        <div id="image_control_no_js">
          <label for="image_width_no_js">Size: </label>
          <input
            name="width"
            id="image_width_no_js"
            type="number"
            min="100"
            max="500"
            value={state.width}
          />
        </div>
        <div id="image_control_js" hidden>
          <label for="image_width">Size: </label>
          <input
            id="image_width"
            name="image_width"
            title="control image width"
            type="range"
            oninput="emit('/editor?width='+this.value)"
            min="100"
            max="500"
            value={state.width}
          />
          <label for="image_width">
            <span id="output-width">{state.width}</span>px
          </label>
        </div>
        {Script(`
      image_control_no_js.remove();
      image_control_js.hidden = false;
      `)}

        <p>
          The state of background color is managed locally (works without
          network)
        </p>
        <div>
          <label>Color: </label>
          {[
            Colors.map(color => {
              let id = `image_color_${color}`
              let attrs: attrs = {}
              if (state.color === color) {
                attrs.checked = 'checked'
              }
              let href = `/editor?color=${color}&width=${state.width}`
              return (
                <div style="display: inline-block; padding: 0.5em">
                  <div href={href}>
                    <input
                      type="radio"
                      id={id}
                      name="color"
                      value={color}
                      {...attrs}
                      onchange={`output_image.style.backgroundColor = this.value`}
                    />
                    <label for={id}>{color}</label>
                  </div>
                </div>
              )
            }),
          ]}
        </div>
        <input id="image_control_submit_no_js" type="submit" value="Update" />
        {Script(`image_control_submit_no_js.remove()`)}
      </form>

      <img
        alt="output image from editor"
        id="output_image"
        width={state.width}
        style={`background-color: ${state.color}`}
        src="https://avatars0.githubusercontent.com/u/6510388"
      />
      <SourceCode page="editor.tsx" />
      <hr />
      <p>
        Reference:{' '}
        <a href="https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript">
          Phoenix LiveView: Interactive, Real-Time Apps. No Need to Write
          JavaScript. - DockYard
        </a>
      </p>
      <div>Screencast from the blog:</div>
      <figure>
        <video
          src="/editor.mp4"
          alt="original image editor demo with Phoenix LiveView"
          muted
          autoplay
          loop
        ></video>
        <figcaption>
          original image editor demo with Phoenix LiveView
          <br />
          image source: https://i.imgur.com/DYIv3ut.gif
        </figcaption>
      </figure>
    </div>
  )
}

export default Editor
