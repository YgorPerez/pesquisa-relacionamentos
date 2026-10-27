// The site search (#275): the reader types a word or a phrase and gets each
// sentence of a Guide, Tip or Fact sheet that has it, with a link that lands
// on that sentence. The text searched is the one the page shows: the same
// views the pages draw (`guide-view.ts`, `view.ts`), read back from their
// HTML. The link carries the section's anchor and a Text Fragment
// (`text-fragment.ts`), which the browser scrolls to and paints without JS.
//
// What stays out: the Fact sheets' Excerpts (quotes in English), the
// Readings, the calculators' controls and the labels the pieces add around
// the text.
import type { Library } from '@tem-estudo/content'
import {
  factSheetPath,
  isFactSheetIndexable,
  tipPath,
  topicPath,
} from '@tem-estudo/content/paths'
import { isTipPublished } from '@tem-estudo/content/queries'
import {
  guideView,
  tipView,
  type ChapterBlock,
  type GuideView,
} from './guide-view'
import {
  BOX_CLASSES,
  fragmentTarget,
  REF_CLASS,
  type CharKind,
  type FragmentPlace,
  type Line,
} from './text-fragment'
import { factSheetView } from './view'

export type SearchKind = 'guide' | 'tip' | 'fact-sheet'

/** A piece of a hit's sentence; `match` is a stretch the query found. */
export interface SearchPiece {
  readonly text: string
  readonly match: boolean
}

export interface SearchHit {
  /** The page, the section's anchor and the Text Fragment. */
  readonly href: string
  /** The Chapter, Question or section the sentence sits in; `null` at the
   * top of the page. */
  readonly place: string | null
  readonly pieces: ReadonlyArray<SearchPiece>
}

export interface SearchGroup {
  readonly kind: SearchKind
  readonly title: string
  readonly path: string
  readonly hits: ReadonlyArray<SearchHit>
}

export interface SearchResults {
  /** The query as searched: trimmed, single spaces, at most `MAX_QUERY`. */
  readonly query: string
  /** `phrase`: the exact phrase occurs; `words`: it does not, and these are
   * the sentences with every word; `none`: nothing, or no query. */
  readonly match: 'phrase' | 'words' | 'none'
  readonly groups: ReadonlyArray<SearchGroup>
  readonly total: number
}

const MIN_QUERY = 2
const MAX_QUERY = 100

/** Where a stretch of text sits on its page. */
interface Place extends FragmentPlace {
  readonly title: string | null
}

interface Passage extends Place {
  readonly html: string
}

interface Page {
  readonly kind: SearchKind
  readonly title: string
  readonly path: string
  readonly passages: ReadonlyArray<Passage>
}

/** A sentence as the page shows it. */
interface Sentence {
  /** The Chapter, Question or section it sits in. */
  readonly place: string | null
  /** Where the link lands on the page: the anchor and the Text Fragment. */
  readonly target: string
  /** The text without the reference numbers: what the result shows. */
  readonly shown: string
  /** `shown` folded (no accents, lowercase), and where each folded
   * character came from in `shown`. */
  readonly folded: string
  readonly origin: ReadonlyArray<number>
}

interface IndexedPage extends Omit<Page, 'passages'> {
  readonly sentences: ReadonlyArray<Sentence>
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}
const escape = (text: string) => text.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c)

// ---- The pages and what of them is searched --------------------------------

/** A piece of a Chapter: its prose, a Tip, a Myth or an answer, whose
 * Question is its own heading and anchor. */
function blockPassages(block: ChapterBlock, place: Place): Passage[] {
  switch (block.kind) {
    case 'text':
      return [{ ...place, html: block.html }]
    case 'tip':
      return [{ ...place, html: block.tip.html }]
    case 'myth':
      return [
        { ...place, html: escape(block.myth.claim) },
        { ...place, html: block.myth.whyNotHtml },
      ]
    case 'question': {
      const { question } = block
      const answer = { anchor: question.slug, title: question.question }
      return [
        { ...answer, heading: true, html: escape(question.question) },
        { ...answer, html: question.answerHtml },
      ]
    }
  }
}

/** A Guide's text, in the page's order (`routes/$tema/index.tsx`): "Em
 * resumo" repeats each answer's first sentence before its Chapter, and the
 * browser lands on that first copy. */
function guidePassages(guide: GuideView): Passage[] {
  const top = { anchor: null, title: null }
  const summary = { anchor: 'em-resumo', title: 'Em resumo' }
  const takeaways = { anchor: 'o-que-levar', title: 'O que levar' }
  const unknowns = { anchor: 'o-que-nao-se-sabe', title: 'O que não se sabe' }
  return [
    { ...top, heading: true, html: escape(guide.title) },
    ...guide.summary.map((q) => ({
      ...summary,
      html: escape(q.firstSentence),
    })),
    { ...top, html: guide.openingHtml },
    ...guide.chapters.flatMap((chapter) => {
      const place = { anchor: chapter.id, title: chapter.title }
      return [
        { ...place, heading: true, html: escape(chapter.title) },
        ...chapter.blocks.flatMap((block) => blockPassages(block, place)),
      ]
    }),
    ...guide.takeaways.map((tip) => ({ ...takeaways, html: tip.html })),
    ...(guide.unknownsHtml ? [{ ...unknowns, html: guide.unknownsHtml }] : []),
  ]
}

function guidePages(library: Library): Page[] {
  return library.topics.map((topic) => {
    const guide = guideView(topic, library)
    return {
      kind: 'guide',
      title: guide.title,
      path: topicPath(topic),
      passages: guidePassages(guide),
    }
  })
}

function tipPages(library: Library): Page[] {
  return library.tips.filter(isTipPublished).map((tip) => {
    const view = tipView(tip, library)
    return {
      kind: 'tip',
      title: view.text,
      path: tipPath(tip),
      passages: [{ anchor: null, title: null, html: escape(view.text) }],
    }
  })
}

function factSheetPages(library: Library): Page[] {
  return library.factSheets.map((factSheet) => {
    const view = factSheetView(factSheet, isFactSheetIndexable(factSheet))
    const top = { anchor: null, title: null }
    const findings = { anchor: 'achados', title: 'Achados' }
    const passages: Passage[] = [
      { ...top, heading: true, html: escape(view.title) },
      { ...top, html: escape(view.strengthReason) },
      { ...top, html: view.sampleHtml },
      ...(view.conflictHtml ? [{ ...top, html: view.conflictHtml }] : []),
      {
        anchor: 'o-que-mediu',
        title: 'O que mediu',
        html: view.whatItMeasuredHtml,
      },
      ...view.findings.flatMap((f) => [
        { ...findings, html: f.value },
        { ...findings, html: f.measure },
      ]),
      ...(view.findingsNotesHtml
        ? [{ ...findings, html: view.findingsNotesHtml }]
        : []),
      ...view.otherSections.map((s, i) => ({
        anchor: `secao-${i}`,
        title: s.title,
        html: s.html,
      })),
      { anchor: 'limitacoes', title: 'Limitações', html: view.limitationsHtml },
    ]
    return {
      kind: 'fact-sheet',
      title: view.title,
      path: factSheetPath(factSheet),
      passages,
    }
  })
}

// ---- From HTML to sentences -------------------------------------------------

/** The elements that start a new line of text: a sentence never crosses
 * them. */
const BLOCKS = new Set([
  'p',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'td',
  'th',
  'tr',
  'dt',
  'dd',
  'div',
  'section',
  'figure',
  'figcaption',
  'caption',
  'blockquote',
  'pre',
  'br',
  'ul',
  'ol',
  'table',
])

/** The elements whose text the page does not show as text: drawings, what
 * is hidden (but not `hidden="until-found"`, which the browser opens when
 * it finds the text), only for screen readers, or a drawing's decoration
 * (`aria-hidden`, such as a Visual's axis). */
const isUnseen = (tag: string, attributes: string) =>
  tag === 'svg' ||
  tag === 'script' ||
  tag === 'style' ||
  (/\shidden(\s|=|\/?$)/.test(attributes) &&
    !/\shidden="until-found"/.test(attributes)) ||
  /\saria-hidden="true"/.test(attributes) ||
  /\sclass="[^"]*\bsr-only\b/.test(attributes)

const VOID = new Set(['br', 'hr', 'img', 'input', 'wbr'])

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

const decode = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name.startsWith('#x') || name.startsWith('#X'))
      return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    if (name.startsWith('#'))
      return String.fromCodePoint(Number.parseInt(name.slice(1), 10))
    return ENTITIES[name.toLowerCase()] ?? whole
  })

const BOX = new RegExp(`\\sclass="(?:${BOX_CLASSES.join('|')})"`)
const REF = new RegExp(`\\sclass="${REF_CLASS}"`)

/** An element still open, with whether it hides its text and what kind its
 * text is. */
interface OpenElement {
  readonly tag: string
  readonly unseen: boolean
  readonly kind: CharKind
}

const opened = (tag: string, attributes: string): OpenElement => ({
  tag,
  unseen: isUnseen(tag, attributes),
  kind: REF.test(attributes) ? 'ref' : BOX.test(attributes) ? 'box' : 'text',
})

/** The kind of the text inside the open elements: a reference wins over a
 * box. */
const kindInside = (open: ReadonlyArray<OpenElement>): CharKind =>
  open.some((e) => e.kind === 'ref')
    ? 'ref'
    : open.some((e) => e.kind === 'box')
      ? 'box'
      : 'text'

/** Closes `tag` and whatever was left open inside it. */
function close(open: OpenElement[], tag: string) {
  const at = open.map((e) => e.tag).lastIndexOf(tag)
  if (at !== -1) open.splice(at)
}

const TAG = /^<(\/?)([a-z][a-z0-9-]*)([^>]*)>$/i

/** The lines of text an HTML shows. The HTML is the server's own, filtered
 * (`safe-html.ts`) or drawn by React, so no `>` sits inside an attribute. */
function lines(html: string): Line[] {
  const out: Line[] = []
  let current: Line = { text: '', kinds: [] }
  const open: OpenElement[] = []
  const append = (text: string, of: CharKind) => {
    current.text += text
    for (let i = 0; i < text.length; i++) current.kinds.push(of)
  }
  const flush = () => {
    if (current.text.trim()) out.push(current)
    current = { text: '', kinds: [] }
  }
  for (const token of html.split(/(<!--[\s\S]*?-->|<[^>]+>)/)) {
    const [, closing, name = '', attributes = ''] = TAG.exec(token) ?? []
    const tag = name.toLowerCase()
    if (token.startsWith('<!--')) continue
    if (!tag) {
      if (!open.some((e) => e.unseen)) append(decode(token), kindInside(open))
      continue
    }
    if (BLOCKS.has(tag)) flush()
    // Inside a Visual, each label and value is a box of its own (flex items,
    // absolute spans): a word apart, and a Text Fragment cannot cross them.
    else if (open.some((e) => e.tag === 'figure')) append(' ', 'box')
    if (closing) close(open, tag)
    else if (!VOID.has(tag) && !attributes.endsWith('/'))
      open.push(opened(tag, attributes))
  }
  flush()
  return out
}

/** Where a sentence ends: after `.`, `!`, `?` or `…` (and a closing quote
 * or parenthesis), before a space and a capital letter. An abbreviation
 * ("et al. (2012)", "online vs. presencial") is followed by neither. */
const SENTENCE_END = /[.!?…]["”')]*(?=\s+["“(]?\p{Lu})/gu

/** Cuts a line into sentences, keeping the kind of each character. */
function sentencesOf(line: Line): Line[] {
  const out: Line[] = []
  let start = 0
  const cut = (stop?: number) =>
    out.push({
      text: line.text.slice(start, stop),
      kinds: line.kinds.slice(start, stop),
    })
  for (const end of line.text.matchAll(SENTENCE_END)) {
    const stop = end.index + end[0].length
    cut(stop)
    start = stop
  }
  cut()
  return out
}

/** The line as the result shows it: without the reference numbers. */
const withoutRefs = (line: Line) =>
  line.text
    .split('')
    .filter((_, i) => line.kinds[i] !== 'ref')
    .join('')

const squeeze = (text: string) => text.replace(/\s+/g, ' ').trim()

/** Lowercase, without accents, and where each character came from. */
function fold(text: string): { folded: string; origin: number[] } {
  let folded = ''
  const origin: number[] = []
  let i = 0
  for (const char of text) {
    const plain = char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    folded += plain
    for (let k = 0; k < plain.length; k++) origin.push(i)
    i += char.length
  }
  return { folded, origin }
}

function sentence(place: Place, line: Line): Sentence | null {
  const shown = squeeze(withoutRefs(line))
  if (!shown) return null
  return {
    place: place.title,
    target: fragmentTarget(place, line),
    shown,
    ...fold(shown),
  }
}

function indexPage({ passages, ...page }: Page): IndexedPage {
  const seen = new Set<string>()
  const sentences: Sentence[] = []
  for (const { html, ...place } of passages)
    for (const line of lines(html))
      for (const part of place.heading ? [line] : sentencesOf(line)) {
        const found = sentence(place, part)
        // The browser lands on the first place the fragment occurs: a
        // repeat (a Tip in its Chapter and again in "O que levar", an
        // answer's first sentence after "Em resumo") is not a hit.
        if (!found || seen.has(found.folded) || seen.has(found.target)) continue
        seen.add(found.folded).add(found.target)
        sentences.push(found)
      }
  return { ...page, sentences }
}

const indexes = new WeakMap<Library, ReadonlyArray<IndexedPage>>()

/** The searchable pages, built once per library: it changes only with the
 * build. */
function index(library: Library): ReadonlyArray<IndexedPage> {
  const known = indexes.get(library)
  if (known) return known
  const built = [
    ...guidePages(library),
    ...tipPages(library),
    ...factSheetPages(library),
  ].map(indexPage)
  indexes.set(library, built)
  return built
}

// ---- Matching ---------------------------------------------------------------

/** A stretch of a folded sentence: where it starts and where it ends. */
type Stretch = readonly [start: number, end: number]

/** The stretches of `folded` that `needle` occupies. */
function occurrences(folded: string, needle: string): Stretch[] {
  const found: Stretch[] = []
  for (
    let at = folded.indexOf(needle);
    at !== -1;
    at = folded.indexOf(needle, at + needle.length)
  )
    found.push([at, at + needle.length])
  return found
}

/** The stretches of the sentence the needles occupy, or `null` if one of
 * them is missing. */
function matches(
  sentence: Sentence,
  needles: ReadonlyArray<string>,
): Stretch[] | null {
  const all: Stretch[] = []
  for (const needle of needles) {
    const found = occurrences(sentence.folded, needle)
    if (found.length === 0) return null
    all.push(...found)
  }
  return all
}

/** The longest sentence the result shows whole; a longer one is cut around
 * its first match. */
const SHOWN_LIMIT = 220

/** Which characters of `shown` the folded stretches cover. */
function markedIn(
  { shown, origin }: Sentence,
  stretches: ReadonlyArray<Stretch>,
): boolean[] {
  const marked = Array.from({ length: shown.length }, () => false)
  for (const [start, end] of stretches) {
    const from = origin[start] ?? 0
    const to = (origin[end - 1] ?? from) + 1
    marked.fill(true, from, to)
  }
  return marked
}

/** The part of `shown` the result shows: all of it, or for a long sentence
 * `SHOWN_LIMIT` characters from a third of that before its first match, cut
 * at spaces. */
function shownWindow(
  shown: string,
  firstMatch: number,
): readonly [from: number, to: number] {
  if (shown.length <= SHOWN_LIMIT) return [0, shown.length]
  const start = Math.max(0, firstMatch - SHOWN_LIMIT / 3)
  const from = start === 0 ? 0 : shown.indexOf(' ', start) + 1
  const end = Math.min(shown.length, from + SHOWN_LIMIT)
  return [from, end === shown.length ? end : shown.lastIndexOf(' ', end)]
}

/** The sentence in pieces, the matched stretches marked. */
function pieces(
  sentence: Sentence,
  stretches: ReadonlyArray<Stretch>,
): SearchPiece[] {
  const { shown } = sentence
  const marked = markedIn(sentence, stretches)
  const [from, to] = shownWindow(shown, marked.indexOf(true))
  const out: SearchPiece[] = from > 0 ? [{ text: '… ', match: false }] : []
  for (let i = from; i < to; i++) {
    const match = marked[i] ?? false
    const last = out.at(-1)
    if (last && last.match === match && i > from)
      out[out.length - 1] = { text: last.text + shown[i], match }
    else out.push({ text: shown[i] ?? '', match })
  }
  if (to < shown.length) out.push({ text: ' …', match: false })
  return out
}

const KIND_ORDER: ReadonlyArray<SearchKind> = ['guide', 'tip', 'fact-sheet']

function search(
  pages: ReadonlyArray<IndexedPage>,
  needles: ReadonlyArray<string>,
): SearchGroup[] {
  return pages
    .map((page): SearchGroup => ({
      kind: page.kind,
      title: page.title,
      path: page.path,
      hits: page.sentences.flatMap((s): SearchHit[] => {
        const found = matches(s, needles)
        return found
          ? [
              {
                href: `${page.path}${s.target}`,
                place: s.place,
                pieces: pieces(s, found),
              },
            ]
          : []
      }),
    }))
    .filter((group) => group.hits.length > 0)
    .sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
        b.hits.length - a.hits.length ||
        a.title.localeCompare(b.title, 'pt-BR'),
    )
}

/** The query as searched: single spaces, at most `MAX_QUERY` characters. */
const cleanQuery = (query: string) => squeeze(query).slice(0, MAX_QUERY).trim()

/** Searches the Guides, Tips and Fact sheets: the exact phrase first, and
 * when it occurs nowhere, the sentences with every word. Accents and case
 * do not count. */
export function searchSite(library: Library, raw: string): SearchResults {
  const query = cleanQuery(raw)
  const { folded } = fold(query)
  const none: SearchResults = { query, match: 'none', groups: [], total: 0 }
  if (folded.length < MIN_QUERY) return none
  const pages = index(library)
  const words = [...new Set(folded.split(' '))]
  const phrase = search(pages, [folded])
  const [match, groups] =
    phrase.length > 0 || words.length === 1
      ? (['phrase', phrase] as const)
      : (['words', search(pages, words)] as const)
  const total = groups.reduce((sum, g) => sum + g.hits.length, 0)
  return total === 0 ? none : { query, match, groups, total }
}
