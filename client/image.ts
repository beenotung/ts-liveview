import { format_byte } from '@beenotung/tslib/format.js'
import { compressMobilePhoto, dataURItoFile } from '@beenotung/tslib/image.js'
import { KB } from '@beenotung/tslib/size'

function compressPhotos(files: FileList) {
  return Promise.all(
    Array.from(files, async file => {
      let dataUrl = await compressMobilePhoto({
        image: file,
        maximumSize: 300 * KB,
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
