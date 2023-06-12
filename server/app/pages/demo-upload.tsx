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

esbuild.buildSync({
  entryPoints: ['client/image.ts'],
  outfile: 'build/image.bundle.js',
  bundle: true,
  minify: config.production,
})

const maxFiles = 5

let style = Style(/* css */ `
#uploadDemo img {
  max-width: 100%;
  max-height: calc(100vh - 2rem);
}
#uploadDemo .del-btn {
  margin-bottom: 0.25rem;
}
#uploadDemo [type=submit] {
  margin-top: 1rem;
}
`)

function View() {
  return (
    <div id="uploadDemo">
      {style}
      <h2>Upload Demo</h2>
      <p>
        This page demo image upload with client-side (canvas based) compression.
      </p>
      <p>
        (For simple file upload (e.g. txt and pdf), Javascript is not required.)
      </p>
      <form method="POST" action="/upload/submit" onsubmit="upload(event)">
        <label>
          Select up to {maxFiles} images to upload:{' '}
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
        <h3>Upload Result</h3>
        <p id="demoUploadResult">not uploaded yet</p>
        {Raw(
          /* html */ `
<script src="/js/image.bundle.js"></script>
<script>
var previewFiles = []
async function previewImages(input) {
  demoUploadResult.textContent = 'not uploaded yet'
  let images = await compressPhotos(input.files)
  for (let image of images) {
    let node = imagePreviewTemplate.content.firstElementChild.cloneNode(true)
    node.querySelector('legend').textContent =
      image.file.name + ' (' + format_byte(image.file.size) + ')'
    node.querySelector('img').src = image.dataUrl
    node.querySelector('.del-btn').onclick = () => {
      let idx = previewFiles.indexOf(image.file)
      if (idx != -1) {
        images.splice(idx, 1)
      }
      node.remove()
    }
    imagePreviewList.appendChild(node)
    previewFiles.push(image.file)
  }
  let form = input.form
  form.onsubmit = async event => {
    event.preventDefault()
    let formData = new FormData()
    for (let file of previewFiles) {
      formData.append('image', file)
    }
    let res = await fetch(form.action, { method: 'POST', body: formData })
    let text = await res.text()
    demoUploadResult.innerHTML = text
  }
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
    maxFileSize: 300 * KB * maxFiles,
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
