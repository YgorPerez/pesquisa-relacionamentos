import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { redirects } from '@tem-estudo/content/search'
import library from 'virtual:library'
import { withRedirects } from '#/platform/redirects'
import { withRequestLog } from '#/platform/request-log'

// The TanStack Start server, with each request logged without the query and
// every response with `Referrer-Policy: strict-origin` (ADR 0001,
// `platform/request-log.ts`). Before the app, the 301s for the trailing
// slash and for `antes` (`platform/redirects.ts`).
export default createServerEntry({
  fetch: withRequestLog(withRedirects(redirects(library), handler.fetch)),
})
