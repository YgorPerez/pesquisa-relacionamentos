// The reader's Grifos on a Guide, a Fact sheet or a Tip (#334). Each page
// mounts it once, next to the popover on selected text. After hydration it
// paints the page's Grifos (`highlight-paint.ts`) and paints them again when
// the store or the quotable text changes; a tap on a painted Grifo opens its
// popover. Without JS, and on the server, there is nothing.
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { followHighlights, readHighlights } from '#/state/highlights'
import {
  onOpenRequest,
  paintedAt,
  paintPage,
  unpaint,
  usePainted,
} from './highlight-paint'
import { HighlightPopover } from './highlight-popover'

/** What a tap on the text lands on, when it is not a control of its own. */
const CONTROL = 'a, button, input, label, [role="dialog"]'

/** Whether a DOM change touched the quotable text. */
const touchesText = (records: ReadonlyArray<MutationRecord>) =>
  records.some((record) => {
    const target =
      record.target instanceof Element
        ? record.target
        : record.target.parentElement
    return (
      target?.closest('[data-quote]') != null ||
      target?.querySelector('[data-quote]') != null
    )
  })

/** Paints again, once per frame, when the quotable text changes. */
function repaintOnChange(paint: () => void) {
  let frame = 0
  const observer = new MutationObserver((records) => {
    if (frame === 0 && touchesText(records))
      frame = requestAnimationFrame(() => {
        frame = 0
        paint()
      })
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  })
  return () => {
    observer.disconnect()
    cancelAnimationFrame(frame)
  }
}

/** Opens the Grifo under a tap, or the one asked for by "Grifar". */
function followTaps(open: (id: string) => void) {
  const onClick = (event: MouseEvent) => {
    if (!(document.getSelection()?.isCollapsed ?? true)) return
    if (event.target instanceof Element && event.target.closest(CONTROL)) return
    const hit = paintedAt(event.clientX, event.clientY)
    if (hit) open(hit.highlight.id)
  }
  document.addEventListener('click', onClick)
  const stop = onOpenRequest(open)
  return () => {
    document.removeEventListener('click', onClick)
    stop()
  }
}

export function HighlightLayer() {
  // The page on the screen: during a navigation, `location` is already the
  // next one while the last page is still drawn.
  const path = useRouterState({
    select: (s) => (s.resolvedLocation ?? s.location).pathname,
  })
  const painted = usePainted()
  const [open, setOpen] = useState<string | null>(null)

  // Paints again when the store changes (here or in another tab) and when
  // the quotable text does.
  useEffect(() => {
    const paint = () => paintPage(path, readHighlights())
    paint()
    const stopText = repaintOnChange(paint)
    const stopStore = followHighlights(paint)
    return () => {
      stopText()
      stopStore()
      unpaint()
    }
  }, [path])
  useEffect(() => followTaps(setOpen), [])

  const shown = painted.find((p) => p.highlight.id === open)
  return shown ? (
    <HighlightPopover painted={shown} close={() => setOpen(null)} />
  ) : null
}
