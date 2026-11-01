import {
  decodeKeptQuote,
  decodeQuoteList,
  type Highlight,
} from './highlight-record'
import { isRecord } from './json-record'
import { stored } from './stored'

/** The longest Nota kept. */
export const NOTE_LENGTH = 500

function validHighlight(raw: unknown): Highlight | null {
  if (!isRecord(raw)) return null
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

export const highlights = stored('highlights', validateHighlights)
