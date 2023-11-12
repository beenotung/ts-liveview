import { config, title } from '../../config.js'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { Request, Response, NextFunction, Router } from 'express'
import { createUploadForm } from '../upload.js'
import { Raw } from '../components/raw.js'
import Style from '../components/style.js'
import { KB } from '@beenotung/tslib/size.js'
import { format_byte, format_time_duration } from '@beenotung/tslib/format.js'
import { mapArray } from '../components/fragment.js'
import { readdirSync, statSync, unlink } from 'fs'
import { join } from 'path'
import { SECOND } from '@beenotung/tslib/time.js'
import { debugLog } from '../../debug.js'
import { nodeListToHTML } from '../jsx/html.js'
import { Context } from '../context.js'
import { loadClientPlugin } from '../../client-plugin.js'
import SourceCode from '../components/source-code.js'

let log = debugLog('demo-upload.tsx')
log.enabled = true

let imagePlugin = loadClientPlugin({
  entryFile: 'dist/client/image.js',
})

const maxFiles = 5
const maxFileSize = 300 * KB * maxFiles
const deleteInterval = 10 * SECOND

let style = Style(/* css */ `
#imagePreviewList,
#uploadDemo fieldset,
#uploadDemo figure,
#uploadDemo img {
  max-width: 100%;
}
#uploadDemo fieldset {
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
  let filenames = readdirSync(config.upload_dir)
  return (
    <div id="uploadDemo">
      {style}
      <h1>Upload Demo</h1>
      <p>
        This page demo image upload with client-side (canvas based) compression.
        Each image is compressed to {format_byte(maxFileSize / maxFiles)}.
      </p>
      <p>
        (For simple file upload (e.g. txt and pdf), Javascript is not required.)
      </p>
      <p>
        For demo purpose, the uploaded images will be deleted automatically
        after {format_time_duration(deleteInterval)}.
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
        <h2>Upload Result</h2>
        <p id="demoUploadResult">Not uploaded yet.</p>
        <h2>Uploaded Images</h2>
        <div id="uploadedImageList">
          {filenames.length === 0 ? (
            <p>No images uploaded yet.</p>
          ) : (
            mapArray(filenames, filename => (
              <UploadedImage filename={filename} />
            ))
          )}
        </div>
        {Raw(
          /* html */ `
${imagePlugin.script}
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
    if (res.ok) {
      demoUploadResult.textContent = 'Uploaded successfully.'
      uploadedImageList.innerHTML = await res.text()
      clearPreviewImages()
    } else {
      demoUploadResult.innerHTML = await res.text()
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

      <SourceCode page="demo-upload.tsx" />
    </div>
  )
}

function UploadedImage(attrs: { filename: string }) {
  let { filename } = attrs
  let file = join(config.upload_dir, filename)
  let size = format_byte(statSync(file).size)
  triggerAutoDelete(file)
  return (
    <figure>
      <img src={'/uploads/' + filename} />
      <figcaption>
        {filename} ({size})
      </figcaption>
    </figure>
  )
}

function triggerAutoDelete(file: string) {
  setTimeout(() => {
    unlink(file, err => {
      if (!err) return
      if (err?.code == 'ENOENT') return
      log('failed to delete uploaded image:', { file, err })
    })
  }, deleteInterval)
}

async function handleUpload(req: Request, res: Response, next: NextFunction) {
  try {
    let form = createUploadForm({
      mimeTypeRegex: /^image\/.*/,
      maxFileSize,
      maxFiles,
    })
    let [_fields, files] = await form.parse(req)
    let images = files.image || []
    let context: Context = {
      type: 'express',
      req,
      res,
      next,
      url: req.url,
    }
    let html = nodeListToHTML(
      images.map(file => <UploadedImage filename={file.newFilename} />),
      context,
    )
    res.setHeader('Content-Type', 'text/html')
    res.end(html)
  } catch (error) {
    next(error)
  }
}

let routes: Routes = {
  '/upload': {
    title: title('Upload Demo'),
    description: 'Demonstrate file upload',
    menuText: 'Upload',
    node: <View />,
  },
}

function attachRoutes(app: Router) {
  app.post('/upload/submit', handleUpload)
}

export default { routes, attachRoutes }
