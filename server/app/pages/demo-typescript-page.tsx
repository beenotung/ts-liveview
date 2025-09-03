import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { Locale, Title } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { env } from '../../env.js'
import { Script } from '../components/script.js'
import { toSlug } from '../format/slug.js'
import { BackToLink } from '../components/back-to-link.js'
import { loadClientPlugin } from '../../client-plugin.js'

// for error display
let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

// for complete page interaction
let pagePlugin = loadClientPlugin({
  entryFile: 'dist/client/demo-typescript-page.js',
})

let pageTitle = <Locale en="AI Camera" zh_hk="AI 鏡頭" zh_cn="AI 摄像头" />

let style = Style(/* css */ `
#DemoTypescriptPage .controls {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem;
}
#DemoTypescriptPage .controls button {
  padding: 0.25rem 0.5rem;
}
#DemoTypescriptPage #container {
  position: relative;
  width: fit-content;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: 0.5rem;
}
#DemoTypescriptPage video {
  transform: scaleX(-1);
  width: 300px;
  max-width: 100%;
  max-height: calc(100dvh - 2rem);
}
#DemoTypescriptPage canvas {
  transform: scaleX(-1);
  position: absolute;
  top: 0;
  left: 0;
}

#faceBlendshapesContainer {
  overflow-y: auto;
  overflow-x: visible;
  padding: 0 1rem;
}

#faceBlendshapesContainer h2 {
  margin-top: 0;
}

#faceBlendshapesContainer .score-bar {
  background-color: lightcoral;
  height: 0.25rem;
}
`)

let page = (
  <>
    {style}
    <div id="DemoTypescriptPage">
      <h1>{pageTitle}</h1>
      <div class="controls">
        <button id="startButton" onclick="startCamera()" disabled>
          Start
        </button>
        <button id="stopButton" hidden>
          Stop
        </button>
        <button id="toggleLandmarksButton" hidden>
          Split / Merge Landmarks
        </button>
      </div>
      <div id="container">
        <video id="video" muted playsinline></video>
        <canvas id="canvas"></canvas>
        <div id="faceBlendshapesContainer">
          <h2>Face Blendshapes</h2>
          <table>
            <thead>
              <tr>
                <th>Index</th>
                <th>Category Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody id="faceBlendshapesTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
    {sweetAlertPlugin.node}
    {pagePlugin.node}
  </>
)

let routes = {
  '/demo-typescript-page': {
    menuText: pageTitle,
    title: <Title t={pageTitle} />,
    description: 'TODO',
    node: page,
  },
} satisfies Routes

export default { routes }
