import { WindowStub } from './internal'
import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision'

let win: WindowStub = window as any
let stream: MediaStream | undefined
let faceLandmarkerPromise: Promise<FaceLandmarker> | undefined

declare const startButton: HTMLButtonElement
declare const stopButton: HTMLButtonElement
declare const toggleLandmarksButton: HTMLButtonElement
declare const video: HTMLVideoElement
declare const canvas: HTMLCanvasElement
declare const faceBlendshapesContainer: HTMLDivElement
declare const faceBlendshapesTableBody: HTMLTableSectionElement

let context = canvas.getContext('2d')!
let drawingUtils = new DrawingUtils(context)

function stopStream() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = undefined
  }
  video.srcObject = null
  video.pause()
}

async function startCamera() {
  stopStream()
  let videoPromise = video.play()
  faceLandmarkerPromise ||= loadModel()
  try {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
      },
      audio: false,
    })
    video.srcObject = stream
    await videoPromise
    startButton.hidden = true
    stopButton.hidden = false
    toggleLandmarksButton.hidden = false
    stopButton.onclick = () => {
      startButton.hidden = false
      stopButton.hidden = true
      toggleLandmarksButton.hidden = true
      stopStream()
    }
    let faceLandmarker = await faceLandmarkerPromise
    await loop(faceLandmarker)
  } catch (error) {
    win.showError(String(error))
  } finally {
    stopStream()
  }
}

async function loadModel() {
  let filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
  )
  let faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1,
  })
  return faceLandmarker
}

async function loop(faceLandmarker: FaceLandmarker) {
  let rect = video.getBoundingClientRect()
  faceBlendshapesContainer.style.maxHeight = `${rect.height * 2}px`
  canvas.width = rect.width
  canvas.height = rect.height
  for (;;) {
    if (typeof video === 'undefined') {
      // e.g. when switch to other pages
      break
    }
    if (video.paused) {
      // e.g. when stopped by user
      break
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    let faceLandmarkerResult = faceLandmarker.detectForVideo(
      video,
      performance.now(),
    )
    for (const landmarks of faceLandmarkerResult.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: '#C0C0C070', lineWidth: 1 },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: '#30FF30' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: '#30FF30' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: '#E0E0E0' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        {
          color: '#E0E0E0',
        },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: '#FF3030' },
      )
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: '#30FF30' },
      )
    }
    for (let faceBlendshape of faceLandmarkerResult.faceBlendshapes) {
      for (let category of faceBlendshape.categories) {
        putScore(category.index, category.categoryName, category.score)
      }
    }
    await new Promise(requestAnimationFrame)
  }
}

function putScore(index: number, name: string, score: number) {
  let row = faceBlendshapesTableBody.querySelector<HTMLTableRowElement>(
    `tr[data-name="${name}"]`,
  )
  if (!row) {
    row = document.createElement('tr')
    row.dataset.name = name
    row.appendChild(createCell(index.toString()))
    row.appendChild(createCell(name))
    row.appendChild(createCell('', createScoreBar()))
    faceBlendshapesTableBody.appendChild(row)
  }
  let cell = row.children[2]
  let text = cell.childNodes[0] as Text
  let scoreBar = cell.childNodes[1] as HTMLDivElement
  text.textContent = score.toFixed(4)
  scoreBar.style.width = `${score * 100}%`
}

function createCell(value: string, child?: Node) {
  let td = document.createElement('td')
  let text = document.createTextNode(value)
  td.appendChild(text)
  if (child) {
    td.appendChild(child)
  }
  return td
}

function createScoreBar() {
  let div = document.createElement('div')
  div.classList.add('score-bar')
  return div
}

toggleLandmarksButton.onclick = () => {
  toggleLandmarksButton.classList.toggle('active')
  if (toggleLandmarksButton.classList.contains('active')) {
    canvas.style.position = 'static'
    canvas.style.background = 'black'
  } else {
    canvas.style.position = 'absolute'
    canvas.style.background = 'transparent'
  }
}

Object.assign(window, {
  startCamera,
})

startButton.disabled = false
