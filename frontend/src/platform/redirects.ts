// One path per page (#15): with a trailing slash, it answers 301 to the one
// without; a path that is in some file's `antes`, 301 to today's. The query
// goes along, so the shared link opens the same state. The `Location` is
// relative: behind Nginx, the app does not know the domain.

type Fetch<Rest extends unknown[]> = (
  request: Request,
  ...rest: Rest
) => Response | Promise<Response>

/** The map is the content package's `redirects(library)`. */
export function withRedirects<Rest extends unknown[]>(
  map: Readonly<Record<string, string>>,
  fetch: Fetch<Rest>,
): (request: Request, ...rest: Rest) => Promise<Response> {
  return async (request, ...rest) => {
    const url = new URL(request.url)
    // `//other.com/` must not become `Location: //other.com`.
    const clean = url.pathname.replace(/^\/+/, '/')
    const noSlash = clean.length > 1 ? clean.replace(/\/+$/, '') || '/' : clean
    const target = Object.hasOwn(map, noSlash) ? map[noSlash] : noSlash
    if (target && target !== url.pathname) {
      // A Question's old page leads to its section, `/<tema>#<question>`
      // (ADR 0042): the query goes before the fragment.
      const [path, fragment] = target.split('#')
      return new Response(null, {
        status: 301,
        headers: {
          location: `${path}${url.search}${fragment ? `#${fragment}` : ''}`,
        },
      })
    }
    return fetch(request, ...rest)
  }
}
