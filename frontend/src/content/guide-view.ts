// The Guide of a Topic, its Questions and the Tips in the shape the pages
// draw. The markdown becomes HTML on the server, with the `[@slug]`
// references numbered by the order of the Fact sheets on the Guide's page and
// the `==…==` key number in pink.
import type {
  Calculator,
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
  topicSearch,
  type SearchMeta,
} from '@tem-estudo/content/search'
import {
  guideMyths,
  guideTips,
  guidesWithTip,
  isTipPublished,
} from '@tem-estudo/content/queries'
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

interface FindingView {
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

export interface QuestionSummary {
  readonly topic: string
  readonly slug: string
  readonly questionHtml: SafeHtml
  readonly question: string
  readonly confidence: Strength
  readonly firstSentence: string
}

/** A Question's section of the Guide (ADR 0042). */
export interface QuestionView extends QuestionSummary {
  readonly answerHtml: SafeHtml
  /** The `covers` of the Fact sheets in the key-number sentence; `null`
   * without a marked number. */
  readonly keyCoverage: ReadonlyArray<Coverage> | null
  /** Every Tip of the Question, in page order. `finding` is the index of the
   * finding it follows, or `null` for a loose one. */
  readonly tips: ReadonlyArray<GuideTip & { readonly finding: number | null }>
  readonly findings: ReadonlyArray<FindingView>
  readonly divergence: {
    readonly bestDesignHtml: SafeHtml
    readonly sides: ReadonlyArray<{
      readonly title: string
      readonly html: SafeHtml
    }>
  } | null
  /** The narrative's own sections; `id` names the headline. */
  readonly sections: ReadonlyArray<{
    readonly id: string
    readonly title: string
    readonly html: SafeHtml
  }>
  /** "E no Brasil?"; `null` until the Topic's rewrite gives it one. */
  readonly inBrazilHtml: SafeHtml | null
  readonly profileHtml: SafeHtml
  /** Every Myth, in page order; `finding` as in `tips`. */
  readonly myths: ReadonlyArray<{
    readonly claim: string
    readonly whyNotHtml: SafeHtml
    readonly finding: number | null
  }>
  /** The calculator card the Question hosts. */
  readonly calculator: Calculator | null
}

/** A group of the Guide's Limitations: about one Study (`factSheet`), under a
 * title of its own, or about one Question while its Limitations still live
 * in the Question file. */
export interface LimitationGroup {
  readonly title: string | null
  readonly factSheet: { readonly n: number; readonly anchor: string } | null
  readonly html: SafeHtml
}

/** The Guide of a Topic: the Topic's whole page (ADR 0042). */
export interface GuideView {
  readonly topic: string
  readonly title: string
  readonly openingHtml: SafeHtml
  /** The index at the top: each Question with its short answer, without the
   * reference numbers. */
  readonly index: ReadonlyArray<
    QuestionSummary & { readonly answerHtml: SafeHtml }
  >
  readonly questions: ReadonlyArray<QuestionView>
  /** "O que levar". */
  readonly takeaways: ReadonlyArray<GuideTip>
  readonly limitations: ReadonlyArray<LimitationGroup>
  /** One list for the whole page, numbered in page order. */
  readonly factSheets: ReadonlyArray<CitedFactSheet>
  /** The related Questions that belong to other Topics. */
  readonly elsewhere: ReadonlyArray<QuestionSummary>
  /** Search and Open Graph title and description (#15). */
  readonly search: SearchMeta
}

export function questionSummary(guide: Guide): QuestionSummary {
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

function guideTip(
  slug: string,
  library: Library,
  numbers: Numbering,
): GuideTip | null {
  const tip = library.tips.find((d) => d.slug === slug)
  return tip
    ? {
        slug,
        html: textWithFactSheets(tip.text, tip.fact_sheets, numbers),
        strength: tip.strength,
        inference: tip.inference,
        appliesTo: appliesTo(tip.covers),
        coverage: tip.covers,
      }
    : null
}

/** The finding a Tip or Myth follows, or `null` for a loose one. */
const findingOf = <T>(
  guide: Guide,
  pick: (finding: Guide['findings'][number]) => ReadonlyArray<T>,
  item: T,
): number | null => {
  const i = guide.findings.findIndex((f) => pick(f).includes(item))
  return i === -1 ? null : i
}

function questionView(
  guide: Guide,
  library: Library,
  numbers: Numbering,
): QuestionView {
  return {
    ...questionSummary(guide),
    answerHtml: html(withReferences(guide.shortAnswer, numbers)),
    keyCoverage: keyCoverage(guide.shortAnswer, library),
    tips: guideTips(guide).flatMap((slug) => {
      const tip = guideTip(slug, library, numbers)
      return tip
        ? [{ ...tip, finding: findingOf(guide, (f) => f.tips, slug) }]
        : []
    }),
    findings: guide.findings.map((a): FindingView => {
      const { country, period } = whereAndWhen(a.countries, a.period)
      return {
        html: textWithFactSheets(a.text, a.fact_sheets, numbers),
        country,
        period,
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
    sections: guide.sections.map((s, i) => ({
      id: `${guide.slug}-secao-${i + 1}`,
      title: s.title,
      html: html(withReferences(s.markdown, numbers)),
    })),
    inBrazilHtml: guide.inBrazil
      ? html(withReferences(guide.inBrazil, numbers))
      : null,
    profileHtml: html(withReferences(guide.variesByProfile, numbers)),
    myths: guideMyths(guide).map((m) => ({
      claim: m.claim,
      whyNotHtml: textWithFactSheets(m.why_not, m.fact_sheets, numbers),
      finding: findingOf(guide, (f) => f.myths, m),
    })),
    calculator: guide.calculator ?? null,
  }
}

/** A `### [@slug]` heading of the Limitations: the group of one Study. */
const STUDY_HEADING = /^\[@([a-z0-9]+(?:-[a-z0-9]+)*)\]$/

/** The Topic's Limitations cut at their `###` headings, then each Question's
 * own, under the Question. */
function limitationGroups(
  topic: Topic,
  guides: ReadonlyArray<Guide>,
  numbers: Numbering,
): LimitationGroup[] {
  const groups: LimitationGroup[] = []
  let title: string | null = null
  let lines: string[] = []
  const flush = () => {
    const markdown = lines.join('\n').trim()
    if (markdown || title !== null) {
      const study = title ? STUDY_HEADING.exec(title)?.[1] : undefined
      const factSheet = study ? numbers.get(study) : undefined
      groups.push({
        title: factSheet ? factSheet.title : title,
        factSheet:
          study && factSheet ? { n: factSheet.n, anchor: anchor(study) } : null,
        html: html(withReferences(markdown, numbers)),
      })
    }
    lines = []
  }
  for (const line of topic.limitations.split('\n')) {
    const heading = /^###\s+(.+?)\s*$/.exec(line)
    if (heading) {
      flush()
      title = heading[1] ?? null
    } else lines.push(line)
  }
  flush()
  for (const guide of guides)
    if (guide.limitations)
      groups.push({
        title: withoutMarks(guide.question),
        factSheet: null,
        html: html(withReferences(guide.limitations, numbers)),
      })
  return groups
}

export function guideView(topic: Topic, library: Library): GuideView {
  const numbers = numberFactSheets(topic.citedFactSheets, library)
  const guides = library.guides.filter((g) => g.topic === topic.slug)
  const here = new Set(guides.map((g) => g.slug))
  const elsewhere = [...new Set(guides.flatMap((g) => g.related))].flatMap(
    (slug) => {
      const other = library.guides.find((g) => g.slug === slug)
      return other && !here.has(other.slug) ? [questionSummary(other)] : []
    },
  )
  return {
    topic: topic.slug,
    title: topic.title,
    openingHtml: html(withReferences(topic.opening, numbers)),
    // The index repeats each short answer without the numbers: the numbers
    // lead to the Fact sheets from the Question's section.
    index: guides.map((g) => ({
      ...questionSummary(g),
      answerHtml: html(withoutReferences(g.shortAnswer)),
    })),
    questions: guides.map((g) => questionView(g, library, numbers)),
    takeaways: topic.takeaways.flatMap((slug) => {
      const tip = guideTip(slug, library, numbers)
      return tip ? [tip] : []
    }),
    limitations: limitationGroups(topic, guides, numbers),
    factSheets: citedFactSheets(topic.citedFactSheets, library),
    elsewhere,
    search: topicSearch(topic),
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
  readonly questions: ReadonlyArray<QuestionSummary>
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
    questions: guidesWithTip(library, tip.slug).map(questionSummary),
    search: tipSearch(tip),
  }
}

export interface CitedIn {
  readonly questions: ReadonlyArray<QuestionSummary>
  readonly tips: ReadonlyArray<TipSummary>
}

/** The Questions and the published Tips that cite the Fact sheet, for its
 * page. A Question also counts when the Fact sheet comes in only through one
 * of its Tips. */
export const citedIn = (slug: string, library: Library): CitedIn => ({
  questions: library.guides
    .filter((g) => g.citedFactSheets.includes(slug))
    .map(questionSummary),
  tips: library.tips
    .filter((d) => isTipPublished(d) && d.fact_sheets.includes(slug))
    .map(tipSummary),
})
