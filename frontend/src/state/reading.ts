// How far the reader got in each Guide (#195): the home page's "Continuar
// lendo" and the "lido" of the Topic index read it. It lives only in this
// browser, like the Profile, and nothing about it goes to the server or to
// the count.
//
// The place is a Chapter and a paragraph, not a scroll offset: the same
// paragraph sits at another height on another screen width, and a small
// edit to the text should not lose it. The paragraph is kept by its position
// in the Chapter and the start of its text; finding it again picks the
// paragraph whose words match best (`matchParagraph`).
//
// The back-and-forth of the browser's history is another store
// (`useReadingPointInHistory`, in `ui/navigation.tsx`), and stays as it is.
import { stored, useStored } from './stored'

/** A paragraph of a Chapter: its index among the Chapter's paragraphs and the
 * start of its text. */
export interface ParagraphMark {
  readonly index: number
  readonly text: string
}

/** Where the reader stopped in a Guide they have not finished. */
export interface ReadingPlace {
  /** The Chapter's anchor (`id`). */
  readonly chapter: string
  readonly chapterTitle: string
  /** The Chapter's number, from 1, and how many the Guide has. */
  readonly chapterNumber: number
  readonly chapters: number
  /** The paragraph at the top of the screen; `null` sends to the Chapter's
   * start. */
  readonly paragraph: ParagraphMark | null
  /** How much of the Guide was read, from 0 to 1. */
  readonly progress: number
  /** When it was saved (ms since 1970), to list the most recent first. */
  readonly at: number
}

export interface Reading {
  /** The Guides started and not finished, by Topic slug. */
  readonly inProgress: Readonly<Record<string, ReadingPlace>>
  /** The Topic slugs of the Guides read to "O que levar". */
  readonly finished: ReadonlyArray<string>
}

/** How much of a paragraph's text is kept to find it again. */
const PARAGRAPH_TEXT_LENGTH = 120

const EMPTY: Reading = { inProgress: {}, finished: [] }

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw)

const isCount = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= 0

function validParagraph(raw: unknown): ParagraphMark | null {
  if (!isRecord(raw) || !isCount(raw['index'])) return null
  const text = raw['text']
  return typeof text === 'string'
    ? { index: raw['index'], text: text.slice(0, PARAGRAPH_TEXT_LENGTH) }
    : null
}

function validPlace(raw: unknown): ReadingPlace | null {
  if (!isRecord(raw)) return null
  const { chapter, chapterTitle, chapterNumber, chapters, progress, at } = raw
  if (typeof chapter !== 'string' || chapter === '') return null
  if (typeof chapterTitle !== 'string') return null
  if (!isCount(chapterNumber) || !isCount(chapters)) return null
  if (chapterNumber < 1 || chapterNumber > chapters) return null
  if (typeof progress !== 'number' || !(progress >= 0 && progress <= 1))
    return null
  if (!isCount(at)) return null
  return {
    chapter,
    chapterTitle,
    chapterNumber,
    chapters,
    paragraph: validParagraph(raw['paragraph']),
    progress,
    at,
  }
}

/** What the storage holds, validated: an entry that does not hold up is
 * dropped alone, and the others stay. */
export function validateReading(raw: unknown): Reading | null {
  if (!isRecord(raw)) return null
  const inProgress = isRecord(raw['inProgress'])
    ? Object.fromEntries(
        Object.entries(raw['inProgress']).flatMap(([topic, place]) => {
          const valid = validPlace(place)
          return valid ? [[topic, valid] as const] : []
        }),
      )
    : {}
  const finished = Array.isArray(raw['finished'])
    ? [
        ...new Set(
          raw['finished'].filter((t): t is string => typeof t === 'string'),
        ),
      ]
    : []
  return { inProgress, finished }
}

const reading = stored('reading', validateReading)

/** The reading saved in this browser; `null` on the server and during
 * hydration. */
export const useReading = (): Reading | null => useStored(reading)

/** The Guides in progress, the most recent first. */
export function inProgress(
  saved: Reading | null,
): ReadonlyArray<{ readonly topic: string; readonly place: ReadingPlace }> {
  return Object.entries(saved?.inProgress ?? {})
    .map(([topic, place]) => ({ topic, place }))
    .sort((a, b) => b.place.at - a.place.at)
}

/** Saves where the reader is in the Guide. A Guide already finished stays
 * finished and out of the list. */
export function saveReadingPlace(topic: string, place: ReadingPlace) {
  const saved = reading.read() ?? EMPTY
  if (saved.finished.includes(topic)) return
  reading.write({
    ...saved,
    inProgress: { ...saved.inProgress, [topic]: place },
  })
}

/** The reader reached "O que levar": the Guide leaves the list and counts as
 * read. */
export function finishReading(topic: string) {
  const saved = reading.read() ?? EMPTY
  if (saved.finished.includes(topic)) return
  const { [topic]: _done, ...rest } = saved.inProgress
  reading.write({ inProgress: rest, finished: [...saved.finished, topic] })
}

/** The × of an item: forgets where the reader was in that Guide. */
export function forgetReading(topic: string) {
  const saved = reading.read()
  if (!saved?.inProgress[topic]) return
  const { [topic]: _forgotten, ...rest } = saved.inProgress
  reading.write({ ...saved, inProgress: rest })
}

/** The saved place in a Guide, outside React (the jump of "continuar"). */
export const readingPlace = (topic: string): ReadingPlace | null =>
  reading.read()?.inProgress[topic] ?? null

/** A paragraph's text as it is kept: spaces collapsed, cut to
 * `PARAGRAPH_TEXT_LENGTH`. */
export const paragraphText = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().slice(0, PARAGRAPH_TEXT_LENGTH)

const words = (text: string) =>
  new Set(text.toLocaleLowerCase('pt-BR').match(/[\p{L}\p{N}]+/gu) ?? [])

/** How alike two texts are, from 0 to 1: the words they share over all the
 * words of both. */
function likeness(a: string, b: string): number {
  const left = words(a)
  const right = words(b)
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const word of left) if (right.has(word)) shared++
  return shared / (left.size + right.size - shared)
}

/** Below this, the paragraph is taken as gone. */
const SAME_PARAGRAPH = 0.5

/** The index, among the Chapter's paragraph texts today, of the saved
 * paragraph: the one whose words match best, and among equals the closest to
 * where it was. `null` when none is close enough (the paragraph is gone). */
export function matchParagraph(
  mark: ParagraphMark,
  texts: ReadonlyArray<string>,
): number | null {
  let best: number | null = null
  let bestScore = SAME_PARAGRAPH
  for (const [index, text] of texts.entries()) {
    const score = likeness(mark.text, paragraphText(text))
    const closer =
      best !== null &&
      score === bestScore &&
      Math.abs(index - mark.index) < Math.abs(best - mark.index)
    if ((best === null && score >= bestScore) || score > bestScore || closer) {
      best = index
      bestScore = score
    }
  }
  return best
}
