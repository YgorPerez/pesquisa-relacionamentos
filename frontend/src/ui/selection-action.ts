// What an action of the popover on selected text receives (#332). Only
// types, in a module of their own: each action imports them without adding
// to the fan-in of `selection-quote.ts`, which reads the page.
import type { ReactNode } from 'react'

/** The selection, as the popover's actions use it. */
export interface Quote {
  /** The text as the page shows it: without the reference numbers nor what
   * only a screen reader hears, one line per block. */
  readonly text: string
  /** The page's address with the section's anchor and the Text Fragment. */
  readonly link: string
  /** The page's path. */
  readonly path: string
  /** The `id` of the section it starts in; `null` at the top of the page. */
  readonly anchor: string | null
  /** The selected stretch, snapped to whole words. */
  readonly range: Range
}

/** What each action of the popover receives (`selection-popover.tsx`). */
export interface SelectionActionProps {
  readonly quote: Quote
  /** Puts `panel` under the actions, in place of what was there: how the
   * copy went, a form. `null` clears it. */
  readonly show: (panel: ReactNode) => void
  /** Closes the popover. */
  readonly close: () => void
}
