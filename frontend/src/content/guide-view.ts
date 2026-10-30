// The Guide of a Topic, its Questions and the Tips in the shape the pages
// draw. The markdown becomes HTML on the server, with the `[@slug]`
// references numbered by the order of the Fact sheets on the Guide's page and
// the `==…==` key number in pink.
import type {
  Calculator,
  Chapter,
  Coverage,
  FactSheet,
  Library,
  Myth,
  Question,
  Strength,
  Tip,
  Topic,
} from '@tem-estudo/content'
import {
  BRAZIL_MARK,
  YOU_MARK,
  withoutTermMarks,
} from '@tem-estudo/content/marks'
import {
  tipSearch,
  topicSearch,
  type SearchMeta,
} from '@tem-estudo/content/search'
import {
  questionBySlug,
  questionsWithTip,
  topicQuestions,
} from '@tem-estudo/content/queries'
import { safeHtml, type SafeHtml } from './safe-html'
import {
  html,
  inlineHtml,
  factSheetSummary,
  type FactSheetSummary,
} from './view'
import { renderVisuals, visualView, type RenderedVisual } from './visuals-view'
import type { ChartView } from '#/ui/visual-chart'
import { topicReadingViews, type ReadingView } from './neighbor-sites-view'
import { pageTerms, withTermLinks, type TermView } from './terms-view'

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

/** The marks inside a sentence (ADR 0042), after the filter: "no Brasil" in
 * ink and paper, and the "vale para você" of a finding, hidden until the
 * page knows the Profile. The finding's id is a slug, checked by the
 * build. */
const withMarks = (filtered: SafeHtml): SafeHtml =>
  filtered
    .replace(BRAZIL_MARK, '<span class="marca-brasil">no Brasil</span>')
    .replace(
      YOU_MARK,
      (_, id: string) =>
        `<span class="selo-voce-texto" data-voce="${id}" hidden>vale para você</span>`,
    ) as SafeHtml

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
  return withoutTermMarks(markdown)
    .replace(REFS, '')
    .replace(/\{\{[^}]*\}\}\s*/g, '')
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

/** The "Vale para:" note of a Tip, taken from the `covers`. */
function appliesTo(coverages: ReadonlyArray<Coverage>): string {
  const sentences = [...new Set(coverages.map(oneCoverage))]
  // With no sentence at all, `every` also gives `true`.
  if (sentences.every((f) => f === ''))
    return 'o estudo não separou por gênero, orientação nem idade.'
  return `${sentences.map((f) => f || 'sem recorte por gênero ou idade').join('; ')}.`
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

/** A Question where the Guide answers it: the short answer with its
 * Confidence, and what the "Para o seu Perfil" line needs. */
export interface QuestionView extends QuestionSummary {
  readonly answerHtml: SafeHtml
  /** The `covers` of the Fact sheets in the key-number sentence; `null`
   * without a marked number. */
  readonly keyCoverage: ReadonlyArray<Coverage> | null
  /** The findings the answer rests on: the page does not list them, but the
   * "Para o seu Perfil" line names the one that has data for the reader. */
  readonly findings: ReadonlyArray<{
    readonly html: SafeHtml
    readonly coverage: ReadonlyArray<Coverage>
  }>
  /** The calculator card that follows the answer. */
  readonly calculator: Calculator | null
}

export interface MythView {
  readonly claim: string
  readonly whyNotHtml: SafeHtml
}

/** A piece of a Chapter, in body order. `key` names it among the Chapter's
 * pieces, for the list React draws. */
export type ChapterBlock = { readonly key: string } & (
  | { readonly kind: 'text'; readonly html: SafeHtml }
  | { readonly kind: 'chart'; readonly visual: ChartView }
  | { readonly kind: 'question'; readonly question: QuestionView }
  | { readonly kind: 'tip'; readonly tip: GuideTip }
  | { readonly kind: 'myth'; readonly myth: MythView }
)

export interface ChapterView {
  readonly id: string
  readonly title: string
  readonly blocks: ReadonlyArray<ChapterBlock>
}

/** The Guide of a Topic: the Topic's whole page (ADR 0042). */
export interface GuideView {
  readonly topic: string
  readonly title: string
  readonly openingHtml: SafeHtml
  readonly chapters: ReadonlyArray<ChapterView>
  /** "Em resumo": each Question with its Confidence and the first sentence
   * of its short answer, as text. */
  readonly summary: ReadonlyArray<QuestionSummary>
  /** "O que levar". */
  readonly takeaways: ReadonlyArray<GuideTip>
  /** "O que não se sabe"; `null` while the Topic waits for its rewrite. */
  readonly unknownsHtml: SafeHtml | null
  /** "Para ler além daqui": the Topic's Readings, Portuguese first; empty
   * when the Topic has none (#179). */
  readonly readings: ReadonlyArray<ReadingView>
  /** One list for the whole page, numbered in page order. */
  readonly factSheets: ReadonlyArray<CitedFactSheet>
  /** The `covers` of each finding, by its id, for the `{{you:<id>}}`
   * marks. */
  readonly youMarks: Readonly<Record<string, ReadonlyArray<Coverage>>>
  /** The Questions of other Topics. */
  readonly elsewhere: ReadonlyArray<QuestionSummary>
  /** The Verbetes the page marks, by slug, for their popover. */
  readonly terms: Readonly<Record<string, TermView>>
  /** Search and Open Graph title and description (#15). */
  readonly search: SearchMeta
}

export function questionSummary(question: Question): QuestionSummary {
  return {
    topic: question.topic,
    slug: question.slug,
    question: withoutMarks(question.question),
    questionHtml: questionHtml(question.question),
    confidence: question.confidence,
    firstSentence: firstSentence(question.answer),
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
  answer: string,
  library: Library,
): ReadonlyArray<Coverage> | null {
  const slugs = keyNumberFactSheets(answer)
  return (
    slugs &&
    slugs.flatMap((slug) => factSheetInLibrary(library, slug)?.covers ?? [])
  )
}

function guideTip(
  slug: string,
  library: Library,
  numbers: Numbering,
  used: Set<string>,
): GuideTip | null {
  const tip = library.tips.find((d) => d.slug === slug)
  return tip
    ? {
        slug,
        html: textWithFactSheets(
          withTermLinks(tip.text, library.terms, used, tip.fact_sheets),
          tip.fact_sheets,
          numbers,
        ),
        strength: tip.strength,
        inference: tip.inference,
        appliesTo: appliesTo(tip.covers),
        coverage: tip.covers,
      }
    : null
}

function questionView(
  question: Question,
  library: Library,
  numbers: Numbering,
  used: Set<string>,
): QuestionView {
  return {
    ...questionSummary(question),
    answerHtml: html(
      withReferences(
        withTermLinks(question.answer, library.terms, used),
        numbers,
      ),
    ),
    keyCoverage: keyCoverage(question.answer, library),
    findings: question.findings.map((f) => ({
      html: textWithFactSheets(f.text, f.fact_sheets, numbers),
      coverage: f.covers,
    })),
    calculator: question.calculator ?? null,
  }
}

const mythView = (myth: Myth, numbers: Numbering): MythView => ({
  claim: myth.claim,
  whyNotHtml: textWithFactSheets(myth.why_not, myth.fact_sheets, numbers),
})

/** What a Chapter's blocks need to be drawn. */
interface Drawing {
  readonly topic: Topic
  readonly library: Library
  readonly numbers: Numbering
  readonly visuals: ReadonlyMap<string, RenderedVisual>
  /** The Verbetes the page marked, as it is drawn. */
  readonly used: Set<string>
}

/** Prose of the body: Verbetes, references, Visuals and the inline marks. */
const prose = (
  markdown: string,
  { library, numbers, visuals, used }: Drawing,
) =>
  withMarks(
    html(
      withReferences(withTermLinks(markdown, library.terms, used), numbers),
      visuals,
    ),
  )

function chapterView(chapter: Chapter, drawing: Drawing): ChapterView {
  const { topic, library, numbers, used } = drawing
  return {
    id: chapter.id,
    title: chapter.title,
    blocks: chapter.parts.flatMap((part, n): ChapterBlock[] => {
      switch (part.kind) {
        case 'text':
          return part.markdown.split(/(\{\{visual:[a-z0-9-]+\}\})/g).flatMap((text, index): ChapterBlock[] => {
            const id = /^\{\{visual:([^}]+)\}\}$/.exec(text)?.[1]
            const raw = topic.visuals.find(v => v.id === id)
            const firstBar = topic.visuals.find(v => v.id === 'como-se-conheceram-1995-2017')
            const firstTable = topic.visuals.find(v => v.id === 'fatia-online-por-estudo')
            if (raw && (raw === firstBar || raw === firstTable)) {
              const view = visualView(raw, library, slug => {
                const ref = numbers.get(slug)
                return ref && { ...ref, anchor: anchor(slug) }
              }, topic.slug)
              if (raw.kind === 'bars' && view.kind === 'bars') return [{
                key: `chart-${id}`, kind: 'chart', visual: {
                  kind: 'bars', id: view.domId, title: view.title, note: view.note,
                  rows: view.bars.map((bar, i) => ({ id: String(i), label: bar.label, value: raw.bars[i]!.value, number: bar.number })),
                },
              }]
              if (raw.kind === 'study-table' && view.kind === 'study-table' && new Set(raw.rows.map(r => r.unit)).size === 1) return [{
                key: `chart-${id}`, kind: 'chart', visual: {
                  kind: 'dots', id: view.domId, title: view.title, note: view.note,
                  rows: view.rows.map((row, i) => ({ id: String(i), label: `${row.study.title}: ${row.measure}`, value: raw.rows[i]!.value, number: row.number })),
                },
              }]
            }
            return text.trim() ? [{ key: `text-${n}-${index}`, kind: 'text', html: prose(text, drawing) }] : []
          })
        case 'question': {
          const question = questionBySlug(library, part.slug)
          return question
            ? [
                {
                  key: `question-${part.slug}`,
                  kind: 'question',
                  question: questionView(question, library, numbers, used),
                },
              ]
            : []
        }
        case 'tip': {
          const tip = guideTip(part.slug, library, numbers, used)
          return tip ? [{ key: `tip-${n}-${part.slug}`, kind: 'tip', tip }] : []
        }
        case 'myth': {
          const myth = topic.myths.find((m) => m.id === part.id)
          return myth
            ? [
                {
                  key: `myth-${part.id}`,
                  kind: 'myth',
                  myth: mythView(myth, numbers),
                },
              ]
            : []
        }
      }
    }),
  }
}

/** The Questions of other Topics that the Guide relates. */
function elsewhere(topic: Topic, library: Library): QuestionSummary[] {
  return topic.related.flatMap((slug) => {
    const other = questionBySlug(library, slug)
    return other && other.topic !== topic.slug ? [questionSummary(other)] : []
  })
}

export function guideView(topic: Topic, library: Library): GuideView {
  const numbers = numberFactSheets(topic.citedFactSheets, library)
  const drawing: Drawing = {
    topic,
    library,
    numbers,
    visuals: renderVisuals(
      topic.visuals,
      library,
      (slug) => {
        const factSheet = numbers.get(slug)
        return factSheet && { ...factSheet, anchor: anchor(slug) }
      },
      topic.slug,
    ),
    used: new Set(),
  }
  const questions = topicQuestions(library, topic.slug)
  return {
    topic: topic.slug,
    title: topic.title,
    openingHtml: prose(topic.opening, drawing),
    chapters: topic.chapters.map((c) => chapterView(c, drawing)),
    // "Em resumo" shows only the first sentence of each short answer,
    // without the reference numbers: the whole answer is in its Chapter.
    summary: questions.map(questionSummary),
    takeaways: topic.takeaways.flatMap((slug) => {
      const tip = guideTip(slug, library, numbers, drawing.used)
      return tip ? [tip] : []
    }),
    unknownsHtml: topic.unknowns ? prose(topic.unknowns, drawing) : null,
    readings: topicReadingViews(library, topic.slug),
    factSheets: citedFactSheets(topic.citedFactSheets, library),
    youMarks: Object.fromEntries(
      topic.findings.map((f) => [f.id, f.covers] as const),
    ),
    elsewhere: elsewhere(topic, library),
    // Last: every block above is drawn and has named its Verbetes.
    terms: pageTerms(drawing.used, library),
    search: topicSearch(topic),
  }
}

export interface TipSummary {
  readonly slug: string
  readonly text: string
  readonly strength: Strength
  readonly inference: boolean
}

export interface TipView extends TipSummary {
  /** The text as the page's title, with its Verbetes linked (#360). */
  readonly textHtml: SafeHtml
  /** The Verbetes it marks, by slug, for their popover. */
  readonly terms: Readonly<Record<string, TermView>>
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
  const used = new Set<string>()
  // Without the other marks and the references, as the plain `text`: the
  // Tip's Fact sheets are listed under it.
  const linked = withTermLinks(
    tip.text.replace(REFS, '').replace(/\{\{[^}]*\}\}\s*/g, ''),
    library.terms,
    used,
    tip.fact_sheets,
  )
  return {
    ...tipSummary(tip),
    textHtml: inlineHtml(linked),
    terms: pageTerms(used, library),
    appliesTo: appliesTo(tip.covers),
    factSheets: citedFactSheets(tip.fact_sheets, library),
    questions: questionsWithTip(library, tip.slug).map(questionSummary),
    search: tipSearch(tip),
  }
}
