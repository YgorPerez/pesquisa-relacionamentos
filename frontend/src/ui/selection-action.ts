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
  /** Puts a form where the reader can type it (#345): under the actions
   * with a mouse, as `show` does; on touch, the popover closes and the form
   * goes in a sheet at the bottom of the screen, titled `title`, because
   * with the keyboard open the popover has a few lines of room. */
  readonly showForm: (title: string, form: ReactNode) => void
  /** Closes the popover or the sheet, clears the selection and tells
   * `message` at the bottom of the screen. */
  readonly finish: (message: string) => void
  /** Closes the popover. */
  readonly close: () => void
}

/** What the actions that the Grifo's popover shares (`highlight-popover.tsx`)
 * get there: the quote, the panel and the way to close, with no form nor
 * sheet. */
export type ActionOnQuote = Pick<
  SelectionActionProps,
  'quote' | 'show' | 'close'
>
