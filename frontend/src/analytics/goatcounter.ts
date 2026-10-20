// The send to the GoatCounter at stats.temestudo.cloud (#35). This file is
// "the script" of the count: `counting.ts` only imports it when the visitor
// can be counted, and with GPC, DNT or the switch off it never reaches the
// browser.
//
// We do not use GoatCounter's `count.js` because it always sends
// `location.search`, and the link query carries the Profile (ADR 0001). Here
// the request carries only the path, the referrer without query, the screen
// width and the bot flag, in the same format as `count.js`
// (`/count?p=…&r=…&s=…`). The country comes from the IP in GoatCounter
// itself, which does not keep the IP.

export interface Hit {
  /** The page path (`/grupo-possivel`) or the event name. */
  readonly path: string
  readonly event?: boolean
  /** Where the visitor came from, only on the visit's first page. */
  readonly referrer?: string
  readonly width: number
  /** The `count.js` bot code (153 = `navigator.webdriver`); 0 if not. */
  readonly bot: number
  /** Busts the browser cache. */
  readonly rnd: string
}

const withoutQuery = (text: string) => text.replace(/[?#].*$/s, '')

function referrerWithoutQuery(
  referrer: string | undefined,
): string | undefined {
  if (!referrer) return undefined
  try {
    const url = new URL(referrer)
    return `${url.origin}${url.pathname}`
  } catch {
    return undefined
  }
}

export function hitUrl(endpoint: string, hit: Hit): string {
  const fields = new URLSearchParams({ p: withoutQuery(hit.path) || '/' })
  const r = hit.event ? undefined : referrerWithoutQuery(hit.referrer)
  if (r) fields.set('r', r)
  if (hit.event) fields.set('e', 'true')
  fields.set('s', String(hit.width))
  if (hit.bot) fields.set('b', String(hit.bot))
  fields.set('rnd', hit.rnd)
  return `${endpoint}?${fields}`
}

/** Sends a hit. `no-cors` and no cookie: the response does not matter. */
export function send(
  endpoint: string,
  hit: Omit<Hit, 'width' | 'bot' | 'rnd'>,
) {
  const url = hitUrl(endpoint, {
    ...hit,
    width: window.screen.width,
    bot: navigator.webdriver ? 153 : 0,
    rnd: Math.random().toString(36).slice(2, 7),
  })
  void fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    credentials: 'omit',
    keepalive: true,
  }).catch(() => {})
}
