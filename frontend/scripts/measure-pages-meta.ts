// What `./measure-pages.ts` measures and against what: the five pages, the
// target (ADR 0033) and the table it prints. Kept apart from what opens a
// browser so the tests can read it without network. Modeled on the Festival
// dos Macacos' `medir-paginas-meta.ts`.
//
// Runs on plain `node`, which reads TypeScript by itself: only syntax it
// strips.

/** The gzip the VPS's Nginx applies (`nginx/temestudo.conf`): `text/html`
 * always, the `gzip_types` and the `gzip_comp_level`, which without a line
 * is 1. */
export type Gzip = { level: number; types: string[] }

export function nginxGzip(conf: string): Gzip {
  const types = /^\s*gzip_types\s+([^;]+);/m.exec(conf)?.[1].trim().split(/\s+/)
  const level = /^\s*gzip_comp_level\s+(\d+);/m.exec(conf)?.[1]
  return {
    level: level ? Number(level) : 1,
    types: ['text/html', ...(types ?? [])],
  }
}

/** Whether Nginx would compress the response with this `Content-Type`. */
export function compressesLikeNginx(
  type: string | undefined,
  gzip: Gzip,
): boolean {
  const withoutParams = type?.split(';')[0].trim().toLowerCase()
  return !!withoutParams && gzip.types.includes(withoutParams)
}

export type PageName =
  | 'home'
  | 'Guide'
  | 'Fact sheet'
  | 'Possible group'
  | 'Priorities'

/** A page of the measurement. `tap` is the Playwright selector of what the
 * person taps as soon as the page opens, the interaction INP comes from. */
export type Page = { name: PageName; path: string; tap: string }

/** The fixture Guide and Fact sheet (`e2e/library`). The Guide is the
 * Topic's page (ADR 0042). */
export const FIXTURE_PATHS = {
  guide: '/onde-conhecer-pessoas',
  factSheet: '/estudos/lima-2015-encontros',
} as const

export function pages(paths: { guide: string; factSheet: string }): Page[] {
  return [
    { name: 'home', path: '/', tap: 'h1' },
    {
      name: 'Guide',
      path: paths.guide,
      tap: 'role=form[name="Seu Perfil"] >> role=radio >> nth=0',
    },
    { name: 'Fact sheet', path: paths.factSheet, tap: 'h1' },
    {
      name: 'Possible group',
      path: '/grupo-possivel',
      tap: 'role=radio[name="superior completo"]',
    },
    {
      name: 'Priorities',
      path: '/prioridades',
      tap: 'role=region[name="Seu topo 3"] >> role=button >> nth=0',
    },
  ]
}

/** A page's target (ADR 0033): the JS and CSS transferred, in KB with gzip,
 * and the LCP and INP, in ms, medians on Lighthouse's slow 4G. */
type Target = { jsKb: number; cssKb: number; lcpMs: number; inpMs: number }

/** Core Web Vitals' "good" LCP and INP, and a CSS ceiling. */
const GOOD = { cssKb: 15, lcpMs: 2500, inpMs: 200 }

/** The JS is the one measured in #59 with about 15% headroom: a chunk that
 * fattens the page goes over it, and whoever raises the ceiling says why. */
const TARGET: Record<PageName, Target> = {
  home: { ...GOOD, jsKb: 200 },
  Guide: { ...GOOD, jsKb: 260 },
  'Fact sheet': { ...GOOD, jsKb: 210 },
  'Possible group': { ...GOOD, jsKb: 250 },
  Priorities: { ...GOOD, jsKb: 240 },
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

/** One opening of the page: the JS and CSS bytes as they arrived, and the
 * LCP and INP in ms. */
export type Run = { js: number; css: number; lcp: number; inp: number }

export type Row = {
  page: PageName
  jsKb: number
  cssKb: number
  lcpMs: number
  inpMs: number
  failures: string[]
}

/** The runs' medians against the page's TARGET. */
export function rowOf(page: PageName, runs: readonly Run[]): Row {
  const m = (field: keyof Run) => median(runs.map((e) => e[field]))
  const row = {
    page,
    jsKb: m('js') / 1024,
    cssKb: m('css') / 1024,
    lcpMs: m('lcp'),
    inpMs: m('inp'),
  }
  const target = TARGET[page]
  const failures: string[] = []
  if (row.jsKb > target.jsKb) failures.push('JS')
  if (row.cssKb > target.cssKb) failures.push('CSS')
  if (row.lcpMs > target.lcpMs) failures.push('LCP')
  if (row.inpMs > target.inpMs) failures.push('INP')
  // A measurement that did not run does not pass silently.
  if (runs.length === 0) failures.push('not measured')
  return { ...row, failures }
}

const number = (n: number, decimals: number) =>
  Number.isNaN(n) ? '—' : n.toFixed(decimals)

/** The table in Markdown, which pastes straight into a PR or an issue. */
export function table(rows: readonly Row[]): string {
  const header = [
    '| Page | JS | CSS | LCP | INP | Passes? |',
    '|---|---|---|---|---|---|',
  ]
  const body = rows.map((l) => {
    const target = TARGET[l.page]
    return [
      l.page,
      `${number(l.jsKb, 1)} KB (≤ ${target.jsKb})`,
      `${number(l.cssKb, 1)} KB (≤ ${target.cssKb})`,
      `${number(l.lcpMs / 1000, 2)} s (≤ ${number(target.lcpMs / 1000, 1)})`,
      `${number(l.inpMs, 0)} ms (≤ ${target.inpMs})`,
      l.failures.length ? `no (${l.failures.join(', ')})` : 'yes',
    ].join(' | ')
  })
  return [...header, ...body.map((l) => `| ${l} |`)].join('\n')
}
