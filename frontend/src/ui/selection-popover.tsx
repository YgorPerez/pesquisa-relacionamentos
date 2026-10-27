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
} from 'react'
import type { SelectionAction } from '#/analytics/events'
import { CopyLink, CopyText } from './selection-copy'
import { POPOVER_LABEL } from './selection-popover.copy'
import {
  quoteOf,
  snapToWords,
  type Quote,
  type SelectionActionProps,
} from './selection-quote'

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

  // Grifar (#334)

  // De onde vem isso? (#336)

  // Comentar (#337)
]

/** How the last selection was made: it decides the side. */
type Pointer = 'mouse' | 'touch'

/** The selection's box, read again each time the popover is placed: it
 * follows the text when the page scrolls. jsdom has no layout. */
function anchorOf(range: Range) {
  return {
    getBoundingClientRect: () =>
      range.getBoundingClientRect?.() ?? new DOMRect(),
    contextElement:
      range.startContainer instanceof Element
        ? range.startContainer
        : (range.startContainer.parentElement ?? undefined),
  }
}

export function SelectionPopover() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [panel, setPanel] = useState<ReactNode>(null)
  const [pointer, setPointer] = useState<Pointer>('mouse')
  const popup = useRef<HTMLDivElement>(null)
  // The router's path, which is the address bar's in the browser and the
  // memory history's in the screen tests.
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const page = { origin: window.location.origin, pathname }
    let pressed = false
    /** The quote on the screen, to tell a new selection from the same one. */
    let shown: Quote | null = null
    const inPopup = (node: EventTarget | Node | null) =>
      node instanceof Node && (popup.current?.contains(node) ?? false)

    const read = () => {
      // A field of the popover (the link to copy by hand) has a selection
      // of its own.
      if (inPopup(document.activeElement)) return
      const selection = document.getSelection()
      const range =
        selection && !selection.isCollapsed && selection.rangeCount > 0
          ? selection.getRangeAt(0)
          : null
      const next = range ? quoteOf(range, page) : null
      const same =
        shown !== null &&
        next !== null &&
        shown.link === next.link &&
        shown.text === next.text
      if (same) return
      shown = next
      setQuote(next)
      setPanel(null)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (inPopup(event.target)) return
      pressed = true
      setPointer(event.pointerType === 'mouse' ? 'mouse' : 'touch')
    }
    const onPointerUp = (event: PointerEvent) => {
      if (!pressed) return
      pressed = false
      const selection = document.getSelection()
      if (
        event.pointerType === 'mouse' &&
        selection &&
        !selection.isCollapsed &&
        selection.rangeCount > 0
      ) {
        // The selection's range is live: snap a copy before swapping it in.
        const range = selection.getRangeAt(0)
        const snapped = snapToWords(range)
        if (
          quoteOf(range, page) &&
          (snapped.compareBoundaryPoints(Range.START_TO_START, range) !== 0 ||
            snapped.compareBoundaryPoints(Range.END_TO_END, range) !== 0)
        ) {
          selection.removeAllRanges()
          selection.addRange(snapped)
        }
      }
      read()
    }
    // While the pointer is down the reader is still selecting; touch moves
    // the selection's handles without a pointer on the page.
    const onSelectionChange = () => {
      if (!pressed) read()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const open = popup.current
      if (!open) return
      if (event.key === 'Escape') {
        setQuote(null)
      } else if (
        event.key === 'Tab' &&
        !event.shiftKey &&
        !inPopup(document.activeElement)
      ) {
        const first = open.querySelector<HTMLElement>('button, input')
        if (first) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerUp, true)
    document.addEventListener('pointercancel', onPointerUp, true)
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('pointerup', onPointerUp, true)
      document.removeEventListener('pointercancel', onPointerUp, true)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [pathname])

  const close = () => setQuote(null)

  return (
    <Popover.Root
      open={quote !== null}
      // A press outside is the selection's to judge: the click that ends a
      // mouse selection lands outside the popover it has just opened, and a
      // press that clears the selection closes it in `read`.
      onOpenChange={(open, details) => {
        if (!open && details.reason !== 'outside-press') close()
      }}
    >
      <Popover.Portal>
        {quote && (
          <Popover.Positioner
            anchor={anchorOf(quote.range)}
            side={pointer === 'touch' ? 'bottom' : 'top'}
            // On touch, below the handles that hang from the selection.
            sideOffset={pointer === 'touch' ? 28 : 8}
            collisionPadding={8}
            className="z-20"
          >
            <Popover.Popup
              ref={popup}
              aria-label={POPOVER_LABEL}
              initialFocus={false}
              finalFocus={false}
              // A press on the popover keeps the selection and its quote.
              onMouseDown={(event) => event.preventDefault()}
              className="max-w-88 rounded-mao border-2 border-tinta bg-papel p-xs select-none"
              data-slot="trecho-acoes"
            >
              <div className="flex flex-wrap gap-xs">
                {ACTIONS.map(({ id, Action }) => (
                  <Action
                    key={id}
                    quote={quote}
                    show={setPanel}
                    close={close}
                  />
                ))}
              </div>
              {panel !== null && (
                <div className="mt-xs select-text">{panel}</div>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        )}
      </Popover.Portal>
    </Popover.Root>
  )
}
