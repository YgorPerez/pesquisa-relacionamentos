// Guides, Topics and Tips in the shape the pages draw. The markdown becomes
// HTML on the server, with the `[@slug]` references numbered by the order of
// the cited Fact sheets and the `==…==` key number in pink.
import type {
  Library,
  Coverage,
  Tip,
  FactSheet,
  Strength,
  Guide,
  Topic,
} from '@tem-estudo/content'
import {
  tipSearch,
  guideSearch,
  topicSearch,
  type SearchMeta,
} from '@tem-estudo/content/search'
import { isTipPublished } from '@tem-estudo/content/queries'
import { safeHtml, type SafeHtml } from './safe-html'
import {
  html,
  inlineHtml,
  factSheetSummary,
  type FactSheetSummary,
} from './view'

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c)

/** A page's numbered Fact sheets: reference N leads to Fact sheet N of the
 * list. */
type Numbering = ReadonlyMap<
  string,
  { readonly n: number; readonly title: string }
>

function numberFactSheets(
  slugs: ReadonlyArray<string>,
  library: Library,
): Numbering {
  return new Map(
    slugs.map((slug, i) => [
      slug,
      {
        n: i + 1,
        title: library.factSheets.find((f) => f.slug === slug)?.title ?? slug,
      },
    ]),
  )
}

const anchor = (slug: string) => `ficha-${slug}`

function reference(slug: string, numbers: Numbering): string {
  const factSheet = numbers.get(slug)
  if (!factSheet) return ''
  return `<a class="ref" href="#${anchor(slug)}" aria-label="Ficha ${factSheet.n}: ${escape(factSheet.title)}">${factSheet.n}</a>`
}

const REFS = /\s*((?:\[@[a-z0-9-]+\]\s*)+)/g

/** Swaps `[@slug]` for the number in the ring and glues the number to the
 * previous word and the following punctuation (The Glued Ref Rule). */
function withReferences(markdown: string, numbers: Numbering): string {
  const marked = markdown.replace(
    /==([^=\n]+)==/g,
    '<mark class="numero-chave">$1</mark>',
  )
  return marked.replace(
    /([^\s<>[\]]*)\s*((?:\[@[a-z0-9-]+\]\s*)*\[@[a-z0-9-]+\])([.,;:!?]*)/g,
    (_, word: string, refs: string, punctuation: string) => {
      const numbersHtml = [...refs.matchAll(/\[@([a-z0-9-]+)\]/g)]
        .map((m) => reference(m[1] ?? '', numbers))
        .join('')
      return `<span class="nw">${word}${numbersHtml}${punctuation}</span>`
    },
  )
}

/** An inline excerpt with `[@slug]` and `==…==`, numbering the Fact sheets in
 * the given order: the same HTML as the Guide's, for the reference ring
 * story. */
export function excerptWithReferences(
  markdown: string,
  factSheets: ReadonlyArray<{ readonly slug: string; readonly title: string }>,
): SafeHtml {
  const numbers: Numbering = new Map(
    factSheets.map((f, i) => [f.slug, { n: i + 1, title: f.title }]),
  )
  return inlineHtml(withReferences(markdown, numbers))
}

/** Inline text with the references of the listed Fact sheets before the
 * final punctuation: "por app ①." */
function textWithFactSheets(
  text: string,
  factSheets: ReadonlyArray<string>,
  numbers: Numbering,
): SafeHtml {
  const refs = factSheets.map((s) => `[@${s}]`).join('')
  const [, body = '', stop = ''] =
    /^([\s\S]*?)([.!?]*)$/.exec(text.trimEnd()) ?? []
  return inlineHtml(withReferences(`${body}${refs}${stop}`, numbers))
}

/** Plain text, for search, Open Graph and the related questions' summary. */
export function withoutMarks(markdown: string): string {
  return markdown
    .replace(REFS, '')
    .replace(/==([^=\n]+)==/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The Fact sheets cited in the short answer's key-number (`==…==`)
 * sentence: their `covers` says whether the number applies to the Profile.
 * `null` if there is no marked number or its sentence cites no Fact sheet. */
export function keyNumberFactSheets(
  markdown: string,
): ReadonlyArray<string> | null {
  const sentence = markdown
    .split(/(?<=[.!?])\s+/)
    .find((f) => /==[^=\n]+==/.test(f))
  const slugs = [...(sentence ?? '').matchAll(/\[@([a-z0-9-]+)\]/g)].map(
    (m) => m[1] ?? '',
  )
  return slugs.length > 0 ? slugs : null
}

const firstSentence = (markdown: string): string => {
  const text = withoutMarks(markdown)
  return /^.+?[.!?](?=\s|$)/.exec(text)?.[0] ?? text
}

/** The Question with its single yellow word (`==word==`). */
const questionHtml = (question: string) =>
  safeHtml(
    escape(question).replace(
      /==([^=]+)==/,
      '<span class="marca-texto">$1</span>',
    ),
  )

const MAX_AGE = 120

function oneCoverage(coverage: Coverage): string {
  const parts: string[] = []
  if (coverage.couple === 'different-sex') parts.push('casais homem-mulher')
  else if (coverage.couple === 'same-sex') parts.push('casais do mesmo sexo')
  const genders = coverage.genders ?? []
  if (genders.length === 1)
    parts.push(genders[0] === 'man' ? 'só homens' : 'só mulheres')
  else if (genders.length === 2 && !coverage.couple)
    parts.push('homens e mulheres')
  const seeks = coverage.seeks ?? []
  if (seeks.length === 1)
    parts.push(`que procuram ${seeks[0] === 'men' ? 'homens' : 'mulheres'}`)
  if (coverage.ages)
    parts.push(
      coverage.ages.max >= MAX_AGE
        ? `a partir de ${coverage.ages.min} anos`
        : `de ${coverage.ages.min} a ${coverage.ages.max} anos`,
    )
  return parts.join(', ')
}

/** The "Vale para:" note of a finding or Tip, taken from the `covers`. */
function appliesTo(coverages: ReadonlyArray<Coverage>): string {
  const sentences = [...new Set(coverages.map(oneCoverage))]
  // With no sentence at all, `every` also gives `true`.
  if (sentences.every((f) => f === ''))
    return 'o estudo não separou por gênero, orientação nem idade.'
  return `${sentences.map((f) => f || 'sem recorte por gênero ou idade').join('; ')}.`
}

/** The sample's country and year, short for the box next to the finding. */
function whereAndWhen(countries: ReadonlyArray<string>, period: string) {
  return {
    country:
      countries.length === 0
        ? 'país não informado'
        : countries.length > 2
          ? `${countries.length} países`
          : countries.join(', '),
    period,
  }
}

export interface GuideTip {
  readonly slug: string
  readonly html: SafeHtml
  readonly strength: Strength
  readonly inference: boolean
  readonly appliesTo: string
  /** The raw `covers`, for the browser to decide the "vale para você" with the
   * Profile. */
  readonly coverage: ReadonlyArray<Coverage>
}

interface GuideFindingView {
  readonly html: SafeHtml
  readonly country: string
  readonly period: string
  readonly appliesTo: string
  readonly coverage: ReadonlyArray<Coverage>
}

export interface CitedFactSheet extends FactSheetSummary {
  readonly n: number
  readonly anchor: string
}

export interface GuideSummary {
  readonly topic: string
  readonly slug: string
  readonly questionHtml: SafeHtml
  readonly question: string
  readonly confidence: Strength
  readonly firstSentence: string
}

export interface GuideView extends GuideSummary {
  readonly topic: string
  readonly topicTitle: string
  readonly answerHtml: SafeHtml
  /** The `covers` of the Fact sheets in the key-number sentence; `null`
   * without a marked number. */
  readonly keyCoverage: ReadonlyArray<Coverage> | null
  readonly tips: ReadonlyArray<GuideTip>
  readonly findings: ReadonlyArray<GuideFindingView>
  readonly divergence: {
    readonly bestDesignHtml: SafeHtml
    readonly sides: ReadonlyArray<{
      readonly title: string
      readonly html: SafeHtml
    }>
  } | null
  /** The Guide's own sections, between the evidence and "Varia conforme o
   * Perfil?"; `id` names the headline. */
  readonly sections: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly html: SafeHtml
  }>
  readonly profileHtml: SafeHtml
  readonly myths: ReadonlyArray<{
    readonly claim: string
    readonly whyNotHtml: SafeHtml
  }>
  readonly limitationsHtml: SafeHtml
  readonly factSheets: ReadonlyArray<CitedFactSheet>
  readonly related: ReadonlyArray<GuideSummary>
  /** Search and Open Graph title and description (#15). */
  readonly search: SearchMeta
}

export function guideSummary(guide: Guide): GuideSummary {
  return {
    topic: guide.topic,
    slug: guide.slug,
    question: withoutMarks(guide.question),
    questionHtml: questionHtml(guide.question),
    confidence: guide.confidence,
    firstSentence: firstSentence(guide.shortAnswer),
  }
}

const factSheetInLibrary = (
  library: Library,
  slug: string,
): FactSheet | undefined => library.factSheets.find((f) => f.slug === slug)

function citedFactSheets(
  slugs: ReadonlyArray<string>,
  library: Library,
): CitedFactSheet[] {
  return slugs.flatMap((slug, i): CitedFactSheet[] => {
    const factSheet = factSheetInLibrary(library, slug)
    return factSheet
      ? [{ ...factSheetSummary(factSheet), n: i + 1, anchor: anchor(slug) }]
      : []
  })
}

function keyCoverage(
  shortAnswer: string,
  library: Library,
): ReadonlyArray<Coverage> | null {
  const slugs = keyNumberFactSheets(shortAnswer)
  return (
    slugs &&
    slugs.flatMap((slug) => factSheetInLibrary(library, slug)?.covers ?? [])
  )
}

function guideTips(
  guide: Guide,
  library: Library,
  numbers: Numbering,
): ReadonlyArray<GuideTip> {
  return guide.tips.flatMap((slug): GuideTip[] => {
    const tip = library.tips.find((d) => d.slug === slug)
    return tip
      ? [
          {
            slug,
            html: textWithFactSheets(tip.text, tip.fact_sheets, numbers),
            strength: tip.strength,
            inference: tip.inference,
            appliesTo: appliesTo(tip.covers),
            coverage: tip.covers,
          },
        ]
      : []
  })
}

function ownSections(guide: Guide, numbers: Numbering): GuideView['sections'] {
  return guide.sections.map((s, i) => ({
    id: `t-secao-${i + 1}`,
    title: s.title,
    html: html(withReferences(s.markdown, numbers)),
  }))
}

export function guideView(guide: Guide, library: Library): GuideView {
  const numbers = numberFactSheets(guide.citedFactSheets, library)
  const topic = library.topics.find((t) => t.slug === guide.topic)
  return {
    ...guideSummary(guide),
    topicTitle: topic?.title ?? guide.topic,
    answerHtml: html(withReferences(guide.shortAnswer, numbers)),
    keyCoverage: keyCoverage(guide.shortAnswer, library),
    tips: guideTips(guide, library, numbers),
    findings: guide.findings.map((a): GuideFindingView => {
      const { country, period } = whereAndWhen(a.countries, a.period)
      return {
        html: textWithFactSheets(a.text, a.fact_sheets, numbers),
        country: country,
        period: period,
        appliesTo: appliesTo(a.covers),
        coverage: a.covers,
      }
    }),
    divergence: guide.divergence
      ? {
          bestDesignHtml: inlineHtml(
            withReferences(guide.divergence.better_design, numbers),
          ),
          sides: guide.divergence.sides.map((l) => ({
            title: l.title,
            html: textWithFactSheets(l.text, l.fact_sheets, numbers),
          })),
        }
      : null,
    sections: ownSections(guide, numbers),
    profileHtml: html(withReferences(guide.variesByProfile, numbers)),
    myths: guide.myths.map((m) => ({
      claim: m.claim,
      whyNotHtml: textWithFactSheets(m.why_not, m.fact_sheets, numbers),
    })),
    limitationsHtml: html(withReferences(guide.limitations, numbers)),
    factSheets: citedFactSheets(guide.citedFactSheets, library),
    related: guide.related.flatMap((slug) => {
      const other = library.guides.find((g) => g.slug === slug)
      return other ? [guideSummary(other)] : []
    }),
    search: guideSearch(guide),
  }
}

export interface TopicView {
  readonly slug: string
  readonly title: string
  readonly contextHtml: SafeHtml
  /** Search and Open Graph title and description (#15). */
  readonly search: SearchMeta
  readonly guides: ReadonlyArray<
    GuideSummary & { readonly answerHtml: SafeHtml }
  >
}

export function topicView(topic: Topic, library: Library): TopicView {
  return {
    slug: topic.slug,
    title: topic.title,
    contextHtml: html(topic.context),
    search: topicSearch(topic),
    // On the Topic page the short answer goes without the numbers: the Fact
    // sheets are in the Guide, and the Topic makes no new claim (#7).
    guides: library.guides
      .filter((g) => g.topic === topic.slug)
      .map((g) => ({
        ...guideSummary(g),
        answerHtml: html(withoutReferences(g.shortAnswer)),
      })),
  }
}

const withoutReferences = (markdown: string) =>
  markdown.replace(REFS, '').replace(/==([^=\n]+)==/g, '$1')

export interface TipSummary {
  readonly slug: string
  readonly text: string
  readonly strength: Strength
  readonly inference: boolean
}

export interface TipView extends TipSummary {
  readonly appliesTo: string
  readonly factSheets: ReadonlyArray<CitedFactSheet>
  readonly guides: ReadonlyArray<GuideSummary>
  readonly search: SearchMeta
}

export const tipSummary = (tip: Tip): TipSummary => ({
  slug: tip.slug,
  text: withoutMarks(tip.text),
  strength: tip.strength,
  inference: tip.inference,
})

export function tipView(tip: Tip, library: Library): TipView {
  return {
    ...tipSummary(tip),
    appliesTo: appliesTo(tip.covers),
    factSheets: citedFactSheets(tip.fact_sheets, library),
    guides: library.guides
      .filter((g) => g.tips.includes(tip.slug))
      .map(guideSummary),
    search: tipSearch(tip),
  }
}

export interface CitedIn {
  readonly guides: ReadonlyArray<GuideSummary>
  readonly tips: ReadonlyArray<TipSummary>
}

/** The Guides and the published Tips that cite the Fact sheet, for its page.
 * A Guide also counts when the Fact sheet comes in only through one of its
 * Tips. */
export const citedIn = (slug: string, library: Library): CitedIn => ({
  guides: library.guides
    .filter((g) => g.citedFactSheets.includes(slug))
    .map(guideSummary),
  tips: library.tips
    .filter((d) => isTipPublished(d) && d.fact_sheets.includes(slug))
    .map(tipSummary),
})
