import { format_byte } from '@beenotung/tslib/format.js'
import { compressMobilePhoto, dataURItoFile } from '@beenotung/tslib/image.js'
import { client_config } from './client-config.js'

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

Object.assign(window, {
  compressPhotos,
  format_byte,
})
