import { format_byte } from '@beenotung/tslib/format.js'
import {
  compressMobilePhoto,
  dataURItoFile,
  resizeImage,
  toImage,
} from '@beenotung/tslib/image.js'
import { client_config } from './client-config.js'
import { selectImage } from '@beenotung/tslib/file.js'

/** @description compress to within the file size budget */
function compressPhotos(files: FileList | File[]) {
  return Promise.all(
    Array.from(files, async file => {
      let dataUrl = await compressMobilePhoto({
        image: file,
        maximumSize: client_config.max_image_size,
        mimeType: 'image/webp',
      })
      file = dataURItoFile(dataUrl, file)
      return { dataUrl, file }
    }),
  )
}

/** @description resize to given dimension */
async function selectPhotos(
  options?: {
    accept?: string
    quality?: number
    multiple?: boolean
  } & ({ width: number; height: number } | { size: number } | {}),
) {
  let files = await selectImage({
    accept: options?.accept || '.jpg,.png,.webp,.heic,.gif',
    multiple: options?.multiple,
  })
  return Promise.all(
    files.map(async file => {
      let image = await toImage(file)
      let width = 720
      let height = 720
      let quality = 0.5
      if (options) {
        if ('size' in options) {
          width = options.size
          height = options.size
        }
        if ('width' in options) {
          width = options.width
        }
        if ('height' in options) {
          height = options.height
        }
        if (options.quality) {
          quality = options.quality
        }
      }
      let dataUrl = resizeImage(image, width, height, 'image/webp', quality)
      file = dataURItoFile(dataUrl, file)
      return { dataUrl, file }
    }),
  )
}

Object.assign(window, {
  compressPhotos,
  selectPhotos,
  format_byte,
})
