// The log of each request on the server (ADR 0001). The share link carries
// the Profile in the query, and the app log keeps only method, path, status
// and time: `GET /grupo-possivel 200 12ms`. The query and the fragment stay
// out, and the `Referer` and the cookies never enter the line. Nor does the
// body: a Comentário (#337) travels in a POST's, and the line keeps only the
// server function's path. The IP is not the app's to log either.
//
// Every response goes out with `Referrer-Policy: strict-origin`, so the
// query does not go along when the visitor opens an external Study. The
// `public/` files do not go through here, and the Nginx vhost puts the same
// header on them (`../../nginx/temestudo.conf`).

type Fetch<Rest extends unknown[]> = (
  request: Request,
  ...rest: Rest
) => Response | Promise<Response>

const REFERRER_POLICY = 'strict-origin'

type Options = {
  /** Where the line goes. On the server, the stdout `docker logs` reads. */
  write?: (line: string) => void
  /** Milliseconds from a clock that only moves forward. */
  now?: () => number
}

/** Wraps the server's `fetch`. `rest` are the options Start passes after the
 * request, which go on as they came. */
export function withRequestLog<Rest extends unknown[]>(
  fetch: Fetch<Rest>,
  { write = console.log, now = () => performance.now() }: Options = {},
): (request: Request, ...rest: Rest) => Promise<Response> {
  return async (request, ...rest) => {
    const start = now()
    const line = (status: number) =>
      `${request.method} ${new URL(request.url).pathname} ${status} ${Math.round(now() - start)}ms`
    let response: Response
    try {
      response = await fetch(request, ...rest)
    } catch (error) {
      write(line(500))
      throw error
    }
    write(line(response.status))
    return withReferrerPolicy(response)
  }
}

/** `Response.redirect` and `fetch` return immutable headers: for those, the
 * response is copied with the new headers. */
function withReferrerPolicy(response: Response): Response {
  try {
    response.headers.set('referrer-policy', REFERRER_POLICY)
    return response
  } catch {
    const headers = new Headers(response.headers)
    headers.set('referrer-policy', REFERRER_POLICY)
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}
