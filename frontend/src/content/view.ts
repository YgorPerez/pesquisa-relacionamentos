// The content package's Fact sheet in the shape the pages draw: the markdown
// already became HTML on the server, and the browser gets only what it shows.
import type { Finding, FactSheet } from '@tem-estudo/content'
import { factSheetSearch, type SearchMeta } from '@tem-estudo/content/search'
import { Marked } from 'marked'
import { safeHtml, type SafeHtml } from './safe-html'

const REPO = 'https://github.com/YgorPerez/pesquisa-relacionamentos/blob/main'

/** A Fact sheet's relative link: another Fact sheet becomes its page; a
 * report, a research note and a local source, which the site does not
 * publish, go to GitHub. */
function rewriteLink(href: string): string {
  if (/^[a-z]+:|^#|^\//i.test(href)) return href
  const path = href.replace(/^(\.\.\/)+|^\.\//, '')
  const factSheet = /^(?:estudos\/)?([a-z0-9-]+)\.md(#.*)?$/.exec(path)
  if (factSheet && (href.startsWith('../estudos/') || !href.includes('/'))) {
    return `/estudos/${factSheet[1]}${factSheet[2] ?? ''}`
  }
  return `${REPO}/${path}`
}

const marked = new Marked({
  gfm: true,
  walkTokens(token) {
    if (token.type === 'link') token.href = rewriteLink(token.href)
  },
})

// The HTML comes out filtered from here: it is what `ui/guide.tsx`'s `Html`
// injects.
export const html = (markdown: string) =>
  safeHtml(marked.parse(markdown, { async: false }))
export const inlineHtml = (markdown: string) =>
  safeHtml(marked.parseInline(markdown, { async: false }))

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
  readonly strength: FactSheet['forca']
  readonly context: string
}

export interface FactSheetView extends FactSheetSummary {
  readonly referenceHtml: SafeHtml
  readonly link: string
  readonly verifiedOn: string | null
  readonly strengthReason: string
  readonly design: FactSheet['desenho']
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
  factSheet: Pick<FactSheet, 'paises' | 'periodo' | 'amostra'>,
): string {
  const { paises: countries } = factSheet
  const parts = [
    countries.length === 0
      ? 'país não informado'
      : countries.length > 3
        ? `${countries.length} países`
        : countries.join(', '),
    factSheet.periodo,
    factSheet.amostra.n
      ? `n = ${numberFormat.format(factSheet.amostra.n)}`
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
    strength: factSheet.forca,
    context: contextLine(factSheet),
  }
}

export function factSheetView(
  factSheet: FactSheet,
  isIndexable: boolean,
): FactSheetView {
  return {
    ...factSheetSummary(factSheet),
    referenceHtml: inlineHtml(factSheet.referencia),
    link: factSheet.link,
    verifiedOn: factSheet.verificado_em ?? null,
    strengthReason: factSheet.forca_porque,
    design: factSheet.desenho,
    countries: factSheet.paises,
    period: factSheet.periodo,
    sampleHtml: inlineHtml(factSheet.amostra.descricao),
    representative: factSheet.amostra.representativa,
    n: factSheet.amostra.n ?? null,
    conflictHtml: factSheet.conflito ? inlineHtml(factSheet.conflito) : null,
    license: factSheet.licenca ?? null,
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
