// A reference ring shows what it cites (#467): a tap marks the cited text in
// place (`cited-text.ts`) and opens, next to the ring, the Fact sheet's card
// from the page's list with the way to its page. With a pointer, hover or
// keyboard focus marks the text without the popover. The mark is
// `::highlight(citacao)` (`drawings.css`), and a Visual's figure takes
// `data-citado`. Without JS, the ring stays the `#ficha-<slug>` link to the
// list at the end.
import { Popover } from '@base-ui/react/popover'
import { useEffect, useState } from 'react'
import type { CitedFactSheet } from '#/content/guide-view'
import { citedBy } from './cited-text'
import { CitedFactSheetCard } from './guide'
import { canPaint } from './highlight-paint'
import { OPEN_FACT_SHEET, referenceLabel } from './reference-popover.copy'
import { SmallLink } from './section'
import { CITING_RING, slugOf } from './selection-sentences'
import { TextPopover } from './text-popover'

/** The name `drawings.css` paints. */
const NAME = 'citacao'
/** What a Visual's figure takes while it is the cited one. */
const CITED_FIGURE = 'data-citado'

const ringOf = (target: EventTarget | null): HTMLElement | null => {
  const ring =
    target instanceof Element ? target.closest(`main ${CITING_RING}`) : null
  return ring instanceof HTMLElement ? ring : null
}

/** Marks what `ring` cites, and gives back how to take the mark off. */
function mark(ring: HTMLElement): () => void {
  const cited = citedBy(ring)
  if (cited instanceof HTMLElement) {
    cited.setAttribute(CITED_FIGURE, '')
    return () => cited.removeAttribute(CITED_FIGURE)
  }
  if (!cited || !canPaint()) return () => {}
  CSS.highlights.set(NAME, new globalThis.Highlight(cited))
  return () => {
    if (canPaint()) CSS.highlights.delete(NAME)
  }
}

interface Opened {
  readonly ring: HTMLElement
  /** The ring's box, which the popover hangs from. */
  readonly range: Range
  readonly factSheet: CitedFactSheet
}

/** Follows the page's rings: the tapped one, the one under the mouse and the
 * one with the keyboard's focus. */
function useRings(factSheets: ReadonlyArray<CitedFactSheet>) {
  const [opened, setOpened] = useState<Opened | null>(null)
  const [hovered, setHovered] = useState<HTMLElement | null>(null)
  const [focused, setFocused] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return
      const ring = ringOf(event.target)
      const factSheet = ring && factSheets.find((f) => f.slug === slugOf(ring))
      if (!ring || !factSheet) return
      event.preventDefault()
      const range = document.createRange()
      range.selectNodeContents(ring)
      setOpened({ ring, range, factSheet })
    }
    // Only a mouse's: a finger's would stay after the tap.
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(ringOf(event.target))
    }
    const onOut = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(ringOf(event.relatedTarget))
    }
    // Only the keyboard's focus marks: a tap's would outlive the popover.
    let byKeyboard = false
    const onKey = () => (byKeyboard = true)
    const onPointer = () => (byKeyboard = false)
    const onFocus = (event: FocusEvent) =>
      setFocused(byKeyboard ? ringOf(event.target) : null)
    const onBlur = () => setFocused(null)
    document.addEventListener('click', onClick)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
    }
  }, [factSheets])

  return {
    opened,
    close: () => setOpened(null),
    marked: opened?.ring ?? hovered ?? focused,
  }
}

/** What a page with rings and its list of Fact sheets mounts once, after its
 * `<Column>`, keyed by the page. */
export function ReferencePopover({
  factSheets,
}: {
  factSheets: ReadonlyArray<CitedFactSheet>
}) {
  const { opened, close, marked } = useRings(factSheets)
  useEffect(() => (marked ? mark(marked) : undefined), [marked])
  if (!opened) return null
  const { range, factSheet } = opened
  return (
    <Popover.Root
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <TextPopover
        range={range}
        side="bottom"
        sideOffset={8}
        aria-label={referenceLabel(factSheet)}
        data-slot="ficha-referencia"
      >
        <div className="grid grid-cols-[34px_1fr] gap-2.5">
          <CitedFactSheetCard factSheet={factSheet} />
        </div>
        <SmallLink
          to="/estudos/$slug"
          params={{ slug: factSheet.slug }}
          className="mt-xs self-start"
        >
          {OPEN_FACT_SHEET}
        </SmallLink>
      </TextPopover>
    </Popover.Root>
  )
}
