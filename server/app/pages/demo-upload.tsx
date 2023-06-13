import { config, title } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { Request, Response, NextFunction } from 'express'
import { createUploadForm } from '../upload.js'
import { Raw } from '../components/raw.js'
import * as esbuild from 'esbuild'
import Style from '../components/style.js'
import { array, object, string } from 'cast.ts'
import { KB } from '@beenotung/tslib/size.js'
import { format_byte } from '@beenotung/tslib/format.js'

esbuild.buildSync({
  entryPoints: ['client/image.ts'],
  outfile: 'build/image.bundle.js',
  bundle: true,
  minify: config.production,
})

const maxFiles = 5
const maxFileSize = 300 * KB * maxFiles

let style = Style(/* css */ `
#imagePreviewList,
#imagePreviewList fieldset,
#imagePreviewList img {
  max-width: 100%;
}
#imagePreviewList fieldset {
  display: inline-block;
}
#uploadDemo img {
  max-height: calc(100vh - 2rem);
}
#uploadDemo .del-btn {
  margin-bottom: 0.25rem;
}
#uploadDemo [type=submit] {
  margin-top: 1rem;
  margin-inline-end: 1rem;
}
#uploadDemo [type=reset] {
  color: red;
}
`)

function View() {
  return (
    <div id="uploadDemo">
      {style}
      <h2>Upload Demo</h2>
      <p>
        This page demo image upload with client-side (canvas based) compression.
        Each image is compressed to {format_byte(maxFileSize / maxFiles)}.
      </p>
      <p>
        (For simple file upload (e.g. txt and pdf), Javascript is not required.)
      </p>
      <form
        method="POST"
        action="/upload/submit"
        onsubmit="upload(event)"
        onreset="clearPreviewImages()"
      >
        <label>
          Select up to {format_byte(maxFileSize)} images to upload:{' '}
          <input
            name="image"
            type="file"
            accept="image/*"
            multiple
            onchange="previewImages(this)"
          />
        </label>
        <div id="imagePreviewList"></div>
        <template id="imagePreviewTemplate">
          <fieldset>
            <legend></legend>
            <button class="del-btn">Remove</button>
            <div>
              <img />
            </div>
          </fieldset>
        </template>
        <input type="submit" value="Upload" />
        <input type="reset" value="Reset" />
        <h3>Upload Result</h3>
        <p id="demoUploadResult">Not uploaded yet.</p>
        {Raw(
          /* html */ `
<script src="/js/image.bundle.js"></script>
<script>
var previewFiles = []
var totalSize = 0
function renderTotalSize() {
  demoUploadResult.textContent = previewFiles.length == 0
    ? 'Not uploaded yet.'
    : previewFiles.length + ' files in ' +
      format_byte(totalSize) + ' to be uploaded.'
}
async function previewImages(input) {
  let images = await compressPhotos(input.files)
  for (let image of images) {
    let node = imagePreviewTemplate.content.firstElementChild.cloneNode(true)
    node.querySelector('legend').textContent =
    image.file.name + ' (' + format_byte(image.file.size) + ')'
    node.querySelector('img').src = image.dataUrl
    node.querySelector('.del-btn').onclick = () => {
      let idx = previewFiles.indexOf(image.file)
      if (idx != -1) {
        previewFiles.splice(idx, 1)
        totalSize -= image.file.size
        renderTotalSize()
      }
      node.remove()
    }
    imagePreviewList.appendChild(node)
    previewFiles.push(image.file)
    totalSize += image.file.size
  }
  renderTotalSize()
  let form = input.form
  form.onsubmit = async event => {
    event.preventDefault()
    let formData = new FormData()
    for (let file of previewFiles) {
      formData.append('image', file)
    }
    let res = await fetch(form.action, { method: 'POST', body: formData })
    if (res.headers.get('Content-Type')?.startsWith('application/json')) {
      demoUploadResult.textContent = JSON.stringify(await res.json(), null, 2)
      demoUploadResult.style.whiteSpace = 'pre-wrap'
    } else {
      demoUploadResult.innerHTML = await res.text()
      demoUploadResult.style.whiteSpace = 'unset'
    }
  }
}
function clearPreviewImages() {
  previewFiles = []
  totalSize = 0
  demoUploadResult.textContent = 'Not uploaded yet.'
  imagePreviewList.textContent = ''
}
</script>
`.trim(),
        )}
      </form>
    </div>
  )
}

let routes: Routes = {
  '/upload': {
    title: title('Upload Demo'),
    description: 'Demonstrate file upload',
    menuText: 'Upload',
    node: <View />,
  },
}

let filesParser = array(
  object({
    newFilename: string(),
  }),
  { maybeSingle: true },
)
let handleUpload = (req: Request, res: Response, next: NextFunction) => {
  let form = createUploadForm({
    mimeTypeRegex: /^image\/.*/,
    maxFileSize,
    maxFiles,
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    let imageFiles = filesParser
      .parse(files.image)
      .map(file => file.newFilename)
    res.json({ imageFiles })
  })
}

export default { routes, handleUpload }
