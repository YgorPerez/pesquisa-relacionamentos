// What `scripts/capture.ts` understands from the command line, and the story
// ids similar to one that does not exist, with no browser: split out to be
// tested (`capture-arguments.test.ts`). Came from the Festival dos Macacos.

export const SCREENS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const

export type Screen = keyof typeof SCREENS

export type Options = {
  /** The path in the app, with the search: `/prioridades?topo=renda`. */
  route: string
  /** Where the app runs, with no trailing slash. */
  base: string
  out: string
  /** The start of each file's name; `-mobile.png` and `-desktop.png` come
   * after. */
  name: string
  /** Playwright selectors tapped in order before the capture. */
  taps: string[]
  /** The whole page, and not only the first screen. */
  full: boolean
  /** Also records a video of each screen, from load to the last tap, with
   * motion on. */
  video: boolean
  screens: Screen[]
}

/** With `--story`: a Storybook story photographed at moments of the
 * animation, on a single screen. */
export type StoryOptions = {
  /** The story id in `index.json`: `ui-profile--empty`. */
  story: string
  /** The moments in ms, counted from the story's load, in order and without
   * repeats. */
  moments: number[]
  /** Where Storybook runs, with no trailing slash. */
  base: string
  out: string
  /** The start of each file's name; `-mobile-0500ms.png` comes after. */
  name: string
  screen: Screen
}

/** Where each one runs by default: the checkout's `pnpm start` and
 * `pnpm storybook` (`scripts/portas.ts`). */
export type Defaults = { out: string; app: string; storybook: string }

export const USAGE = `Usage: node scripts/capture.ts <route> [options]

  --tap <selector>     taps a Playwright selector first; repeat, in order
  --full               captures the whole page, not only the first screen
  --video              also records a video of each screen (.mp4 with ffmpeg, .webm without)
  --only mobile|desktop only one of the screens (390×844 and 1280×800)
  --name <name>        start of the files' names (default: the route)
  --out <folder>       where to write (default: <tmp>/captures)
  --base <url>         where the app runs (default: this checkout's \`pnpm start\`)
  --port <n>           the same as --base http://localhost:<n>

Or a Storybook story, at moments of the animation:

  node scripts/capture.ts --story <id> --at 0,500,1000 [options]

  --story <id>         the story id in the running Storybook's index.json
  --at <ms,ms,...>     the moments, counted from the story's load (default: 0)
  --only mobile|desktop the screen (default: mobile)
  --name, --out, --base and --port as above; the default Storybook is this
  checkout's \`pnpm storybook\``

const WITH_VALUE = new Set([
  '--tap',
  '--only',
  '--name',
  '--out',
  '--base',
  '--port',
  '--story',
  '--at',
])
const WITHOUT_VALUE = new Set(['--full', '--video'])

/** `/estudos/costa-2018?de=busca` → `estudos-costa-2018`. */
export function routeName(route: string): string {
  const path = route.split('?')[0] ?? ''
  const name = path
    .split('/')
    .filter(Boolean)
    .join('-')
    .replace(/[^\w.-]/g, '_')
  return name || 'home'
}

export function readArguments(
  argv: readonly string[],
  defaults: Defaults,
): Options | StoryOptions | { error: string } {
  const split = splitArgs(argv)
  if ('error' in split) return split
  const { values, flags } = split
  const last = (option: string) => values.get(option)?.at(-1)
  const base = baseFrom(last)
  if (typeof base === 'object') return base
  if (values.has('--story'))
    return fromStory(split, last, {
      out: defaults.out,
      base: base ?? defaults.storybook,
    })
  if (values.has('--at')) return { error: '--at is only for --story' }

  const route = routeFrom(split.routes)
  if (typeof route !== 'string') return route

  const screens = screensFrom(last('--only'))
  if ('error' in screens) return screens

  return {
    route,
    base: base ?? defaults.app,
    out: last('--out') ?? defaults.out,
    name: last('--name') ?? routeName(route),
    taps: values.get('--tap') ?? [],
    full: flags.has('--full'),
    video: flags.has('--video'),
    screens,
  }
}

/** Where the app or Storybook runs, from `--base` or `--port`, or `undefined`
 * for each one's default. */
function baseFrom(
  last: (option: string) => string | undefined,
): string | undefined | { error: string } {
  const base = last('--base')
  const port = last('--port')
  if (base !== undefined && port !== undefined)
    return { error: '--base or --port, not both' }
  if (port === undefined) return base?.replace(/\/+$/, '')
  if (!/^\d+$/.test(port)) return { error: '--port takes a number' }
  return `http://localhost:${port}`
}

/** The options only a route capture understands. */
const ROUTE_ONLY = ['--tap', '--full', '--video']

function fromStory(
  { routes, values, flags }: Split,
  last: (option: string) => string | undefined,
  defaults: { out: string; base: string },
): StoryOptions | { error: string } {
  if (routes.length > 0) return { error: '--story takes no route' }
  const ofRoute = ROUTE_ONLY.find(
    (option) => flags.has(option) || values.has(option),
  )
  if (ofRoute) return { error: `${ofRoute} does not work with --story` }
  const moments = momentsFrom(last('--at') ?? '0')
  if ('error' in moments) return moments
  const screen = last('--only') ?? 'mobile'
  if (!(screen in SCREENS)) return { error: '--only takes mobile or desktop' }
  const story = last('--story') as string
  return {
    story,
    moments,
    base: defaults.base,
    out: last('--out') ?? defaults.out,
    name: last('--name') ?? story,
    screen: screen as Screen,
  }
}

/** `500,0,1000` → `[0, 500, 1000]`: the capture's clock only moves forward. */
function momentsFrom(at: string): number[] | { error: string } {
  const parts = at.split(',').map((part) => part.trim())
  if (parts.some((part) => !/^\d+$/.test(part)))
    return { error: `--at takes milliseconds separated by commas: ${at}` }
  return [...new Set(parts.map(Number))].sort((a, b) => a - b)
}

/** The screens from `--only`, or both without it. */
function screensFrom(only: string | undefined): Screen[] | { error: string } {
  if (only === undefined) return ['mobile', 'desktop']
  if (!(only in SCREENS)) return { error: '--only takes mobile or desktop' }
  return [only as Screen]
}

/** The command line in three piles: the routes, each option with a value
 * with all the values that came, in order, and the flags that are on. */
type Split = {
  routes: string[]
  values: Map<string, string[]>
  flags: Set<string>
}

function splitArgs(argv: readonly string[]): Split | { error: string } {
  const routes: string[] = []
  const values = new Map<string, string[]>()
  const flags = new Set<string>()
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string
    if (!arg.startsWith('--')) {
      routes.push(arg)
      continue
    }
    if (WITHOUT_VALUE.has(arg)) {
      flags.add(arg)
      continue
    }
    if (!WITH_VALUE.has(arg)) return { error: `Unknown option: ${arg}` }
    const value = argv[i + 1]
    if (value === undefined || value.startsWith('--'))
      return { error: `${arg} takes a value` }
    values.set(arg, [...(values.get(arg) ?? []), value])
    i++
  }
  return { routes, values, flags }
}

/** The route, a single one, with the leading slash. */
function routeFrom(routes: readonly string[]): string | { error: string } {
  const [route] = routes
  if (route === undefined) return { error: 'The route is missing' }
  if (routes.length > 1)
    return { error: `A single route, and ${routes.length} came` }
  return route.startsWith('/') ? route : `/${route}`
}

/** The story ids of a Storybook `index.json`. Docs pages stay out: they are
 * not a story one photographs. */
export function indexIds(index: unknown): string[] {
  const entries = (index as { entries?: Record<string, { type?: string }> })
    ?.entries
  if (!entries) return []
  return Object.keys(entries).filter((id) => entries[id]?.type === 'story')
}

/** Up to `count` ids similar to the requested one, best first: the ones with
 * more pieces of the request and, among them, the closest by edit distance.
 * An id with no piece in common only gets in a few letters away from the
 * request, as in a typo. */
export function similarIds(
  requested: string,
  ids: readonly string[],
  count = 5,
): string[] {
  const target = requested.toLowerCase().replaceAll('/', '-')
  const targetPieces = new Set(pieces(target))
  const near = Math.max(2, Math.floor(target.length / 4))
  const candidates: { id: string; common: number; distance: number }[] = []
  for (const id of ids) {
    const its = new Set(pieces(id))
    const common = [...targetPieces].filter((p) => its.has(p)).length
    const far = distance(target, id)
    if (common > 0 || far <= near)
      candidates.push({ id, common, distance: far })
  }
  return candidates
    .sort(
      (a, b) =>
        b.common - a.common ||
        a.distance - b.distance ||
        a.id.localeCompare(b.id),
    )
    .slice(0, count)
    .map(({ id }) => id)
}

function pieces(id: string): string[] {
  return id.split('-').filter(Boolean)
}

/** The Levenshtein distance: how many letters to insert, delete or swap. */
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++)
      current[j] = Math.min(
        (previous[j] ?? 0) + 1,
        (current[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    previous = current
  }
  return previous[b.length] ?? 0
}
