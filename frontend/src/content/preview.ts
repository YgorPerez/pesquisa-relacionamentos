// The Possible group link preview (#34, story 66), built on the server: the
// social network's bot does not run the page's JavaScript, so the preview's
// range comes from the same count (`group-preview.ts`), done here over the
// per-place packs the build writes (`vite/possible-group.ts`). Only the page
// opened with the link query calls this, and only on the server: in the
// browser, the count stays local.
import { createServerFn } from '@tanstack/react-start'
import {
  openPack,
  type PlaceData,
  type PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import type { Preview } from '@tem-estudo/rules/link'
import { buildGroupPreview } from './group-preview'

/** The preview's Open Graph, for the calculator's `head`; empty without a
 * preview. */
export const previewMeta = (preview: Preview | null) =>
  preview
    ? [
        { property: 'og:title', content: preview.title },
        { property: 'og:description', content: preview.description },
      ]
    : []

const opened = new Map<string, Promise<PlaceData | null>>()

/** The place's pack: the file in `public/` next to the build's server
 * (`.output/public`, or `/app/public` in the image) or, in `vite dev`, what
 * the plugin serves. Kept in memory after the first request. */
async function pack(base: string, place: PackPlace): Promise<PlaceData | null> {
  const key = `${base}/${place}`
  let request = opened.get(key)
  if (!request) {
    request = readPack(base, place).then((raw) => (raw ? openPack(raw) : null))
    opened.set(key, request)
  }
  return request
}

async function readPack(base: string, place: PackPlace): Promise<unknown> {
  const [fs, path, url] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
    import('node:url'),
  ])
  const file = path.join('public', base, `${place}.json`)
  for (
    let folder = path.dirname(url.fileURLToPath(import.meta.url));
    ;
    folder = path.dirname(folder)
  ) {
    try {
      return JSON.parse(await fs.readFile(path.join(folder, file), 'utf8'))
    } catch {
      if (path.dirname(folder) === folder) break
    }
  }
  const { getRequestUrl } = await import('@tanstack/react-start/server')
  const response = await fetch(
    new URL(`${base}/${place}.json`, getRequestUrl()),
  )
  return response.ok ? response.json() : null
}

/** The Possible group link preview; `null` if the query is not a link's or
 * the data is missing. */
export const fetchGroupPreview = createServerFn({ method: 'GET' })
  .validator((query: unknown) =>
    typeof query === 'string' ? query.slice(0, 2000) : '',
  )
  .handler(async ({ data: query }): Promise<Preview | null> => {
    const { default: data } = await import('virtual:possible-group')
    return buildGroupPreview(query, data, (place) => pack(data.base, place))
  })
