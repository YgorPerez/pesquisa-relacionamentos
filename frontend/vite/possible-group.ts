// The Possible group data in the browser (#31). The Census CSV is 119 MB
// (kept gzipped in the repository, under GitHub's 100 MB per file):
// instead of it, the build writes one JSON pack per place (Brazil and each
// state, the latter with its municipalities), and the page downloads only
// what the count needs. The count runs in the browser, so the Requirements
// and the Profile never leave the device (story 68).
//
// The packs live at `/dados/grupo-possivel/<version>/<place>.json`, with the
// version taken from the content: a new CSV changes the path, and the long
// cache never serves stale data. `virtual:possible-group` gives the version,
// the places and the estimate for someone who has not said anything yet
// (Brazil, no Profile), which the page draws on the server before
// downloading any pack.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import {
  openPack,
  readGroupBase,
  packForPlace,
  type GroupFiles,
  type PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import { DEFAULT_REQUIREMENTS, STATES } from '@tem-estudo/rules/requirements'
import type { Plugin } from 'vite-plus'

const ID = 'virtual:possible-group'
const RESOLVED = `\0${ID}`
const PATH = '/dados/grupo-possivel'

const FILES: Record<keyof GroupFiles, string> = {
  census: 'censo-2022.csv.gz',
  ages: 'sidra-9514-idade.csv',
  municipalities: 'sidra-10185-municipios.csv',
  pns: 'pns-2019.csv',
  pnad: 'pnad-2022.csv',
}

export interface BuiltData {
  readonly version: string
  /** The JSON text of each pack. */
  readonly packs: ReadonlyMap<PackPlace, string>
  readonly example: Estimate
}

/** Reads `data/possible-group/` and builds the packs. */
export function buildPacks(folder: string): BuiltData {
  const read = (name: string) => {
    const file = readFileSync(resolve(folder, name))
    return (name.endsWith('.gz') ? gunzipSync(file) : file).toString('utf8')
  }
  const texts = Object.fromEntries(
    Object.entries(FILES).map(([key, name]) => [key, read(name)]),
  ) as unknown as GroupFiles
  const base = readGroupBase(texts)
  const places: PackPlace[] = [
    'BR',
    ...STATES.map((u) => u.abbr).filter((state) =>
      base.census.some((row) => row.uf === state),
    ),
  ]
  const packs = new Map(
    places.map((place) => [place, JSON.stringify(packForPlace(base, place))]),
  )
  const hash = createHash('sha256')
  for (const text of packs.values()) hash.update(text)
  const brazil = openPack(JSON.parse(packs.get('BR')!))
  return {
    version: hash.digest('hex').slice(0, 10),
    packs: packs,
    example: estimateGroup(
      { profile: null, requirements: DEFAULT_REQUIREMENTS },
      { brazil },
    ),
  }
}

/** `raiz` is the library's root, already validated (`vite/environment.ts`). */
export function possibleGroup({ root }: { root: string }): Plugin {
  const folder = resolve(root, 'data', 'possible-group')
  let built: BuiltData | undefined
  const data = () => (built ??= buildPacks(folder))

  return {
    name: 'tem-estudo:possible-group',
    resolveId(id) {
      return id === ID ? RESOLVED : undefined
    },
    load(id) {
      if (id !== RESOLVED) return undefined
      for (const name of Object.values(FILES))
        this.addWatchFile(resolve(folder, name))
      const { version, packs, example } = data()
      return `export default ${JSON.stringify({
        base: `${PATH}/${version}`,
        places: [...packs.keys()],
        example: example,
      })}`
    },
    // The packs go to the browser output, served as static files.
    generateBundle() {
      if (this.environment.name !== 'client') return
      const { version, packs } = data()
      for (const [place, text] of packs)
        this.emitFile({
          type: 'asset',
          fileName: `${PATH.slice(1)}/${version}/${place}.json`,
          source: text,
        })
    },
    configureServer(server) {
      server.middlewares.use(PATH, (request, response, next) => {
        const [, version, file] = (request.url ?? '').split('/')
        const place = file?.replace(/\.json$/, '') as PackPlace | undefined
        const text =
          place && version === data().version
            ? data().packs.get(place)
            : undefined
        if (!text) return next()
        response.setHeader('content-type', 'application/json')
        response.end(text)
      })
    },
  }
}
