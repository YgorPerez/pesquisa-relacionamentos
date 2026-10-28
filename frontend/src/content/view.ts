// The content package's Fact sheet in the shape the pages draw: the markdown
// already became HTML on the server, and the browser gets only what it shows.
import type { Finding, FactSheet } from '@tem-estudo/content'
import { withoutTermMarks } from '@tem-estudo/content/marks'
import { factSheetSearch, type SearchMeta } from '@tem-estudo/content/search'
import { Marked } from 'marked'
import { safeHtml, type SafeHtml } from './safe-html'
import type { RenderedVisual } from './visuals-view'

const REPO = 'https://github.com/YgorPerez/pesquisa-relacionamentos/blob/main'

/** A Fact sheet's relative link: another Fact sheet becomes its page; a
 * report, a research note and a local source, which the site does not
 * publish, go to GitHub. */
function rewriteLink(href: string): string {
  if (/^[a-z]+:|^#|^\//i.test(href)) return href
  const path = href.replace(/^(\.\.\/)+|^\.\//, '')
  const factSheet = /^(?:studies\/)?([a-z0-9-]+)\.md(#.*)?$/.exec(path)
  if (factSheet && (href.startsWith('../studies/') || !href.includes('/'))) {
    return `/estudos/${factSheet[1]}${factSheet[2] ?? ''}`
  }
  return `${REPO}/${path}`
}

/** Where a Visual goes in the filtered HTML: a private-use character the
 * library's text never has, around the id. */
const VISUAL_MARK = ''

const marked = new Marked({
  gfm: true,
  walkTokens(token) {
    if (token.type === 'link') token.href = rewriteLink(token.href)
  },
  // A body line `{{visual:<id>}}` (#182) becomes a mark that the filter lets
  // through, and `html()` swaps it for the Visual drawn on the server.
  extensions: [
    {
      name: 'visual',
      level: 'block',
      start: (src: string) => /^\{\{visual:/m.exec(src)?.index,
      tokenizer(src: string) {
        const line = /^\{\{visual:([a-z0-9-]+)\}\}[^\S\n]*(?:\n+|$)/.exec(src)
        return line
          ? { type: 'visual', raw: line[0], id: line[1] ?? '' }
          : undefined
      },
      renderer: (token) => `${VISUAL_MARK}${String(token.id)}${VISUAL_MARK}\n`,
    },
  ],
})

/** The HTML of a body that may place Visuals: `visuals` has each one drawn
 * (`visuals-view.ts`). It comes out filtered from here: it is what
 * `ui/guide.tsx`'s `Html` injects. The Visuals go in after the filter, which
 * strips SVG; React drew them from checked data and escaped every text. */
export function html(
  markdown: string,
  visuals: ReadonlyMap<string, RenderedVisual> = new Map(),
): SafeHtml {
  // A Verbete reads as its word until the page draws it (#351).
  const filtered = safeHtml(
    marked.parse(withoutTermMarks(markdown), { async: false }),
  )
  return filtered.replace(
    new RegExp(`${VISUAL_MARK}([a-z0-9-]+)${VISUAL_MARK}`, 'g'),
    (_, id: string) => {
      const visual = visuals.get(id)
      if (visual === undefined)
        throw new Error(
          `the body places the Visual "${id}", and none was drawn`,
        )
      return visual
    },
  ) as SafeHtml
}
export const inlineHtml = (markdown: string) =>
  safeHtml(marked.parseInline(withoutTermMarks(markdown), { async: false }))

export interface FindingView {
  readonly measure: SafeHtml
  readonly value: SafeHtml
  readonly locator: SafeHtml
  readonly excerpt: SafeHtml | null
}

/** What the `/estudos` list shows of each Fact sheet. */
export interface FactSheetSummary {
  readonly slug: string
  readonly title: string
  readonly status: FactSheet['status']
  readonly strength: FactSheet['strength']
  readonly context: string
}

export interface FactSheetView extends FactSheetSummary {
  readonly referenceHtml: SafeHtml
  readonly link: string
  readonly verifiedOn: string | null
  readonly strengthReason: string
  readonly design: FactSheet['design']
  readonly countries: ReadonlyArray<string>
  readonly period: string
  readonly sampleHtml: SafeHtml
  readonly representative: boolean
  readonly n: number | null
  readonly conflictHtml: SafeHtml | null
  readonly license: string | null
  readonly whatItMeasuredHtml: SafeHtml
  readonly findings: ReadonlyArray<FindingView>
  readonly findingsNotesHtml: SafeHtml | null
  readonly otherSections: ReadonlyArray<{
    readonly title: string
    readonly html: SafeHtml
  }>
  readonly limitationsHtml: SafeHtml
  readonly indexable: boolean
  /** Search title and description (#15). */
  readonly search: SearchMeta
}

const numberFormat = new Intl.NumberFormat('pt-BR')

/** "EUA · 2017 · 5.421 participantes", the list's short context line. */
function contextLine(
  factSheet: Pick<FactSheet, 'countries' | 'period' | 'sample'>,
): string {
  const { countries } = factSheet
  const parts = [
    countries.length === 0
      ? 'país não informado'
      : countries.length > 3
        ? `${countries.length} países`
        : countries.join(', '),
    factSheet.period,
    factSheet.sample.n
      ? `n = ${numberFormat.format(factSheet.sample.n)}`
      : null,
  ]
  return parts.filter(Boolean).join(' · ')
}

const findingView = (a: Finding): FindingView => ({
  measure: inlineHtml(a.measure),
  value: inlineHtml(a.value),
  locator: inlineHtml(a.locator),
  excerpt: a.excerpt ? inlineHtml(a.excerpt) : null,
})

export function factSheetSummary(factSheet: FactSheet): FactSheetSummary {
  return {
    slug: factSheet.slug,
    title: factSheet.title,
    status: factSheet.status,
    strength: factSheet.strength,
    context: contextLine(factSheet),
  }
}

export function factSheetView(
  factSheet: FactSheet,
  isIndexable: boolean,
): FactSheetView {
  return {
    ...factSheetSummary(factSheet),
    referenceHtml: inlineHtml(factSheet.reference),
    link: factSheet.link,
    verifiedOn: factSheet.verified_on ?? null,
    strengthReason: factSheet.strength_reason,
    design: factSheet.design,
    countries: factSheet.countries,
    period: factSheet.period,
    sampleHtml: inlineHtml(factSheet.sample.description),
    representative: factSheet.sample.representative,
    n: factSheet.sample.n ?? null,
    conflictHtml: factSheet.conflict ? inlineHtml(factSheet.conflict) : null,
    license: factSheet.license ?? null,
    whatItMeasuredHtml: html(factSheet.whatItMeasured),
    findings: factSheet.findings.map(findingView),
    findingsNotesHtml: factSheet.findingsNotes
      ? html(factSheet.findingsNotes)
      : null,
    otherSections: factSheet.otherSections.map((s) => ({
      title: s.title,
      html: html(s.markdown),
    })),
    limitationsHtml: html(factSheet.limitations),
    indexable: isIndexable,
    search: factSheetSearch(factSheet),
  }
}
