// The image to post next to the link (#302), in the Possible group's
// "Compartilhar": square (1:1) for the feed, 9:16 for stories. It is drawn
// in the browser (`share-image.draw.ts`) and goes to the phone's share
// sheet, or downloads where there is none. Its text comes from the link's
// own query (`groupImage`), so it shows only what the link carries.
import type { GroupImage } from '@tem-estudo/rules/link'
import { useState } from 'react'
import { SiteButton } from './button'
import { IMAGE_FORMATS, IMAGE_NOTE, IMAGE_OUTCOME } from './share-image.copy'
import {
  drawGroupImage,
  imageBlob,
  loadImageFonts,
  type ImageFormat,
} from './share-image.draw'

const FORMATS = (['square', 'story'] as const).map((format) => ({
  format,
  ...IMAGE_FORMATS[format],
}))

type Outcome = 'none' | 'working' | 'downloaded' | 'failed'

async function makeFile(image: GroupImage, format: ImageFormat, name: string) {
  await loadImageFonts()
  const canvas = document.createElement('canvas')
  drawGroupImage(canvas, image, format)
  return new File([await imageBlob(canvas)], name, { type: 'image/png' })
}

function download(file: File) {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export function ShareImage({ image }: { image: GroupImage }) {
  const [outcome, setOutcome] = useState<Outcome>('none')

  const offer = async (format: ImageFormat, name: string) => {
    setOutcome('working')
    let file: File
    try {
      file = await makeFile(image, format, name)
    } catch {
      setOutcome('failed')
      return
    }
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
      } catch {
        // Closing the share sheet is not an error.
      }
      setOutcome('none')
      return
    }
    download(file)
    setOutcome('downloaded')
  }

  return (
    <div className="mt-md">
      <div className="flex flex-wrap gap-sm">
        {FORMATS.map(({ format, label, file }) => (
          <SiteButton
            key={format}
            variant="light"
            disabled={outcome === 'working'}
            onClick={() => offer(format, file)}
          >
            {label}
          </SiteButton>
        ))}
      </div>
      <p className="mt-xs mb-0 leading-nota">{IMAGE_NOTE}</p>
      <p
        role="status"
        className="mt-xs mb-0 text-label leading-nota font-normal text-tinta-2 empty:m-0"
      >
        {outcome === 'downloaded' || outcome === 'failed'
          ? IMAGE_OUTCOME[outcome]
          : ''}
      </p>
    </div>
  )
}
