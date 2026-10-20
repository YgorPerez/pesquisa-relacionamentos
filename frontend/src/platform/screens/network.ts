// The screen tests' network (ADR 0035), through MSW. The screens' only
// `fetch` is the Possible group packs' (`state/group-packs.ts`), and here
// they come from the fixture data, built by the same `montarPacotes` as the
// build (`vite/possible-group.ts`). A request with no written answer fails
// the test (`setup.ts`): the screen does not reach the real network.
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { resolve } from 'node:path'
import possibleGroup from 'virtual:possible-group'
import { buildPacks } from '../../../vite/possible-group.ts'

const DATA = resolve(
  import.meta.dirname,
  '../../../e2e/library/dados/grupo-possivel',
)

let built: ReturnType<typeof buildPacks> | undefined
const packs = () => (built ??= buildPacks(DATA)).packs

const PACK = `${possibleGroup.base}/:file`

export const server = setupServer(
  http.get(PACK, ({ params }) => {
    const place = String(params.file).replace(/\.json$/, '')
    const text = packs().get(place as never)
    return text
      ? new HttpResponse(text, {
          headers: { 'content-type': 'application/json' },
        })
      : new HttpResponse(null, { status: 404 })
  }),
)

/** The Possible group packs do not arrive: the device has no network, until
 * the end of the test or until `voltar`. */
export function goOffline() {
  server.use(http.get(PACK, () => HttpResponse.error()))
  return { restore: () => server.resetHandlers() }
}
