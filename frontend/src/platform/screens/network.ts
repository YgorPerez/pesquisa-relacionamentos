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
  '../../../e2e/library/data/possible-group',
)

let built: ReturnType<typeof buildPacks> | undefined
const files = () => (built ??= buildPacks(DATA)).files

const PACK = `${possibleGroup.base}/:file`

export const server = setupServer(
  http.get(PACK, ({ params }) => {
    const text = files().get(String(params.file))
    return text
      ? new HttpResponse(text, {
          headers: { 'content-type': 'application/json' },
        })
      : new HttpResponse(null, { status: 404 })
  }),
)

/** The Possible group packs do not arrive: the device has no network, until
 * the end of the test or until `restore`. With `detailOnly`, only the detail
 * packs (`-detalhe.json`) fail, as when the network drops after the default
 * ones arrived. */
export function goOffline({ detailOnly = false } = {}) {
  server.use(
    http.get(PACK, ({ params }) =>
      !detailOnly || String(params.file).endsWith('-detalhe.json')
        ? HttpResponse.error()
        : undefined,
    ),
  )
  return { restore: () => server.resetHandlers() }
}
