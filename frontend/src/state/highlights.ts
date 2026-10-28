// The reader's Grifos and their Notas (#334, GLOSSARY): stretches of a
// Guide, a Fact sheet or a Tip marked to see again. They live only in this
// browser, like the Profile: never synced, never sent, never counted.
//
// A Grifo keeps the quote as the page's text had it (`exact`) and a little
// text on each side (`prefix`, `suffix`), the way a W3C TextQuoteSelector
// does. The page finds it again by the exact quote, and the sides only pick
// among repeats (`ui/highlight-text.ts`); there is no fuzzy matching. When
// the quote is no longer on its page, the Grifo stays here with `changed`
// set, Nota intact, and `/grifos` (#335) says "este trecho mudou". Everything
// that page needs to list a Grifo (its page, its title, its link, its text)
// is stored here, so it never has to read the Guide's DOM.
import { useSyncExternalStore } from 'react'
import {
  decodeKeptQuote,
  decodeQuoteList,
  isQuoteRecord,
  markedFound,
  sameQuote,
  type Highlight,
} from './highlight-record'
import { stored } from './stored'

/** What a page gives to make a Grifo; the store adds the rest. */
export type NewHighlight = Omit<Highlight, 'id' | 'note' | 'changed' | 'at'>

/** How much text on each side is kept to tell repeats apart. */
export { CONTEXT_LENGTH } from './highlight-record'

/** The longest Nota kept. */
export const NOTE_LENGTH = 500

function validHighlight(raw: unknown): Highlight | null {
  if (!isQuoteRecord(raw)) return null
  const quote = decodeKeptQuote(raw)
  if (!quote) return null
  const { note } = raw
  return {
    ...quote,
    note: typeof note === 'string' ? note.slice(0, NOTE_LENGTH) : '',
  }
}

/** What the storage holds, validated: a Grifo that does not hold up is
 * dropped alone, and the others stay. */
export function validateHighlights(
  raw: unknown,
): ReadonlyArray<Highlight> | null {
  return decodeQuoteList(raw, validHighlight)
}

const highlights = stored('highlights', validateHighlights)

/** No Grifo: one array, so React sees the same snapshot each time. */
const NONE: ReadonlyArray<Highlight> = []

/** Calls `notify` on every change, in this tab or another, until the
 * returned function is called. */
export const followHighlights = (notify: () => void): (() => void) =>
  highlights.subscribe(notify)

/** Every Grifo, outside React. */
export const readHighlights = (): ReadonlyArray<Highlight> =>
  highlights.read() ?? NONE

/** Every Grifo, in React. `null` on the server and during hydration, which
 * tells "not read yet" from "none" (`useStored` gives `null` for both). */
export const useHighlights = (): ReadonlyArray<Highlight> | null =>
  useSyncExternalStore(highlights.subscribe, readHighlights, () => null)

const save = (next: ReadonlyArray<Highlight>) =>
  highlights.write(next.length > 0 ? [...next] : null)

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** Saves a Grifo and returns it. The same quote at the same place of the same
 * page is the Grifo already there. */
export function addHighlight(made: NewHighlight): Highlight {
  const saved = readHighlights()
  const same = saved.find((h) => h.path === made.path && sameQuote(h, made))
  if (same) return same
  const highlight: Highlight = {
    ...made,
    id: newId(),
    note: '',
    changed: false,
    at: Date.now(),
  }
  save([...saved, highlight])
  return highlight
}

/** Writes the Grifo's Nota; an empty one removes it. */
export function setNote(id: string, note: string) {
  const clean = note.trim().slice(0, NOTE_LENGTH)
  save(readHighlights().map((h) => (h.id === id ? { ...h, note: clean } : h)))
}

/** "Tirar grifo": forgets the Grifo and its Nota. */
export function removeHighlight(id: string) {
  const saved = readHighlights()
  if (saved.some((h) => h.id === id)) save(saved.filter((h) => h.id !== id))
}

/** After the page at `path` looked for its Grifos: the ones in `found` were
 * there, the others are marked changed. Writes only when a mark moves. */
export function markFound(path: string, found: ReadonlySet<string>) {
  const next = markedFound(readHighlights(), path, found)
  if (next) save(next)
}
