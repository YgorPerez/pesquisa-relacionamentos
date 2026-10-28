// The popover on selected text (#332): select a stretch of a Guide, a Fact
// sheet or a Tip, and a row of actions opens next to it. Only the text the
// site search reads counts (`quotable()` in `selection-quote.ts`); anywhere
// else, and without JS, the browser's own selection and copy are all there
// is.
//
// It opens above the selection with a mouse and below it on touch, where the
// system menu (Copiar, Selecionar tudo) sits above; with no room on that
// side, it flips. A mouse selection snaps to whole words when the button
// comes up; a keyboard one is left as the reader made it, and Tab goes into
// the popover. Escape closes it and keeps the selection.
import { Popover } from '@base-ui/react/popover'
import { useRouterState } from '@tanstack/react-router'
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from 'react'
import type { SelectionAction } from '#/analytics/events'
import { BottomSheet } from './bottom-sheet'
import { HighlightAction } from './highlight-action'
import { Notices, useNotice, type NoticeLink } from './notice'
import { CommentOnQuote } from './selection-comment'
import { CopyLink, CopyText } from './selection-copy'
import { POPOVER_LABEL } from './selection-popover.copy'
import type { Quote, SelectionActionProps } from './selection-action'
import { quoteOf, snapToWords, type QuotedPage } from './selection-quote'
import { WhereFrom } from './selection-source'
import { PopoverPanel, TextPopover } from './text-popover'

// The actions, in the popover's order (#332). Each is a component of its
// own file that gets the quote, a place for a panel under the row and the
// way to close; a new action is one import and one line here, in its slot.
// The empty lines keep the parallel branches from touching the same lines.
const ACTIONS: ReadonlyArray<{
  readonly id: SelectionAction
  readonly Action: ComponentType<SelectionActionProps>
}> = [
  { id: 'copy', Action: CopyText },

  { id: 'link', Action: CopyLink },

  { id: 'highlight', Action: HighlightAction },

  { id: 'source', Action: WhereFrom },

  { id: 'comment', Action: CommentOnQuote },
]

/** How the last selection was made: it decides the side. */
type Pointer = 'mouse' | 'touch'

/** The selected range, or `null` when nothing is selected. */
function selectedRange(): Range | null {
  const selection = document.getSelection()
  return selection && !selection.isCollapsed && selection.rangeCount > 0
    ? selection.getRangeAt(0)
    : null
}

/** Grows a quotable selection to whole words. The selection's range is
 * live: the copy is snapped before it is swapped in. */
function snapSelection(page: QuotedPage) {
  const range = selectedRange()
  if (!range || !quoteOf(range, page)) return
  const snapped = snapToWords(range)
  if (
    snapped.compareBoundaryPoints(Range.START_TO_START, range) === 0 &&
    snapped.compareBoundaryPoints(Range.END_TO_END, range) === 0
  )
    return
  const selection = document.getSelection()!
  selection.removeAllRanges()
  selection.addRange(snapped)
}

/** Tab from the page goes to the popover's first control. */
function tabIntoPopover(event: KeyboardEvent, popup: HTMLElement) {
  if (event.key !== 'Tab' || event.shiftKey) return
  if (popup.contains(document.activeElement)) return
  const first = popup.querySelector<HTMLElement>('button, input')
  if (!first) return
  event.preventDefault()
  first.focus()
}

interface Follower {
  readonly page: QuotedPage
  readonly popup: () => HTMLElement | null
  /** A new quote, or `null` when the selection leaves the quotable text. */
  readonly onQuote: (quote: Quote | null) => void
  readonly onPointer: (pointer: Pointer) => void
}

/** Follows the page's selection until the returned function is called. */
function followSelection({ page, popup, onQuote, onPointer }: Follower) {
  let pressed = false
  /** The quote on the screen, to tell a new selection from the same one. */
  let shown: Quote | null = null
  const inPopup = (node: EventTarget | null) =>
    node instanceof Node && (popup()?.contains(node) ?? false)

  const read = () => {
    // A field of the popover (the link to copy by hand) has a selection of
    // its own.
    if (inPopup(document.activeElement)) return
    const range = selectedRange()
    const next = range ? quoteOf(range, page) : null
    if (next?.link === shown?.link && next?.text === shown?.text) return
    shown = next
    onQuote(next)
  }
  const onPointerDown = (event: PointerEvent) => {
    if (inPopup(event.target)) return
    pressed = true
    onPointer(event.pointerType === 'mouse' ? 'mouse' : 'touch')
  }
  const onPointerUp = (event: PointerEvent) => {
    if (!pressed) return
    pressed = false
    if (event.pointerType === 'mouse') snapSelection(page)
    read()
  }
  // While the pointer is down the reader is still selecting; touch moves the
  // selection's handles without a pointer on the page.
  const onSelectionChange = () => {
    if (!pressed) read()
  }
  const onKeyDown = (event: KeyboardEvent) => {
    const open = popup()
    if (!open) return
    if (event.key === 'Escape') {
      shown = null
      onQuote(null)
    } else tabIntoPopover(event, open)
  }

  const listeners = [
    ['pointerdown', onPointerDown],
    ['pointerup', onPointerUp],
    ['pointercancel', onPointerUp],
    ['selectionchange', onSelectionChange],
    ['keydown', onKeyDown],
  ] as const
  for (const [type, listener] of listeners)
    document.addEventListener(type, listener as EventListener, true)
  return () => {
    for (const [type, listener] of listeners)
      document.removeEventListener(type, listener as EventListener, true)
  }
}

/** The actions, side by side, wrapping on a narrow screen. */
function ActionRow(props: SelectionActionProps) {
  return (
    <div className="flex flex-wrap gap-xs">
      {ACTIONS.map(({ id, Action }) => (
        <Action key={id} {...props} />
      ))}
    </div>
  )
}

/** The quote of the page's selection, the panel under the actions and how
 * the selection was made. */
function useSelectionQuote(popup: RefObject<HTMLDivElement | null>) {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [panel, setPanel] = useState<ReactNode>(null)
  const [pointer, setPointer] = useState<Pointer>('mouse')
  // The router's path, which is the address bar's in the browser and the
  // memory history's in the screen tests.
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  useEffect(
    () =>
      followSelection({
        page: { origin: window.location.origin, pathname },
        popup: () => popup.current,
        onQuote: (next) => {
          setQuote(next)
          setPanel(null)
        },
        onPointer: setPointer,
      }),
    [pathname, popup],
  )
  return { quote, panel, setPanel, pointer, close: () => setQuote(null) }
}

/** The form in the sheet at the bottom of the screen, with its title. */
interface SheetForm {
  readonly title: string
  readonly form: ReactNode
}

/** The popover, and on touch the sheet its form moves to (#345). */
function SelectionActions() {
  const popup = useRef<HTMLDivElement>(null)
  const { quote, panel, setPanel, pointer, close } = useSelectionQuote(popup)
  const [sheet, setSheet] = useState<SheetForm | null>(null)
  const notice = useNotice()

  const showForm = (title: string, form: ReactNode) => {
    if (pointer === 'mouse') return setPanel(form)
    // The page's selection goes, and with it the system's menu and handles
    // over the text; the sheet keeps the quote it was given.
    document.getSelection()?.removeAllRanges()
    close()
    setSheet({ title, form })
  }
  const finish = (message: string, link?: NoticeLink) => {
    document.getSelection()?.removeAllRanges()
    close()
    setSheet(null)
    notice(message, link)
  }

  return (
    <>
      <Popover.Root
        open={quote !== null}
        // A press outside is the selection's to judge: the click that ends a
        // mouse selection lands outside the popover it has just opened, and a
        // press that clears the selection closes it in `read`.
        onOpenChange={(open, details) => {
          if (!open && details.reason !== 'outside-press') close()
        }}
      >
        {quote && (
          <TextPopover
            range={quote.range}
            side={pointer === 'touch' ? 'bottom' : 'top'}
            // On touch, below the handles that hang from the selection.
            sideOffset={pointer === 'touch' ? 28 : 8}
            ref={popup}
            aria-label={POPOVER_LABEL}
            initialFocus={false}
            finalFocus={false}
            // A press on the popover keeps the selection and its quote; a
            // press on a text field of a panel (the Comentário) focuses it.
            onMouseDown={(event) => {
              if (!(event.target as Element).closest('textarea, input'))
                event.preventDefault()
            }}
            className="select-none"
            data-slot="trecho-acoes"
          >
            <ActionRow
              quote={quote}
              show={setPanel}
              showForm={showForm}
              finish={finish}
              close={close}
            />
            {panel !== null && (
              <PopoverPanel className="select-text">{panel}</PopoverPanel>
            )}
          </TextPopover>
        )}
      </Popover.Root>
      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.title ?? ''}
      >
        {sheet?.form}
      </BottomSheet>
    </>
  )
}

export function SelectionPopover() {
  return (
    <Notices>
      <SelectionActions />
    </Notices>
  )
}
