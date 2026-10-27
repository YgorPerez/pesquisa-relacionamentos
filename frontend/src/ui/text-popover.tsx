// What the two popovers over the page's text share (#332): the one on
// selected text (`selection-popover.tsx`) and a Grifo's
// (`highlight-popover.tsx`). Both hang from a range of the text, wear the
// same sheet of paper, and put their panel (a form, a list, how a copy
// went) under the row of actions. The popover never grows past the screen:
// it takes the height the side it opens on has left, and the panel scrolls
// inside it while the row stays.
import { Popover } from '@base-ui/react/popover'
import type { ComponentProps } from 'react'

/** `base`, with the caller's classes after it. */
const joined = (base: string, extra: string | undefined) =>
  extra ? `${base} ${extra}` : base

/** The range's box, read again each time the popover is placed: it follows
 * the text when the page scrolls. jsdom has no layout. */
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

/** The portal, the place next to `range` and the sheet. The rest of the
 * props go to Base UI's `Popover.Popup`; the caller's `className` is added
 * to the sheet's. */
export function TextPopover({
  range,
  side,
  sideOffset,
  className,
  ...popup
}: Omit<ComponentProps<typeof Popover.Popup>, 'className'> & {
  className?: string
  range: Range
  side: 'top' | 'bottom'
  sideOffset: number
}) {
  return (
    <Popover.Portal>
      <Popover.Positioner
        anchor={anchorOf(range)}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={8}
        className="z-20"
      >
        <Popover.Popup
          {...popup}
          className={joined(
            'flex max-h-(--available-height) max-w-88 flex-col rounded-mao border-2 border-tinta bg-papel p-xs',
            className,
          )}
        />
      </Popover.Positioner>
    </Popover.Portal>
  )
}

/** The panel under the row: it scrolls when the screen has no room for it
 * (the Comentário form on a phone). */
export function PopoverPanel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={joined('mt-xs min-h-0 shrink overflow-y-auto', className)}
    />
  )
}

/** A popover's small line: how a copy went, what goes with a Comentário,
 * what the selected sentences cite. */
export function PopoverLine({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      {...props}
      className={joined(
        'm-0 text-label leading-nota font-normal text-tinta-2',
        className,
      )}
    />
  )
}
