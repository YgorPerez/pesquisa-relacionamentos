// The reader's Grifos on a Guide, a Fact sheet or a Tip (#334). Each page
// mounts it once, next to the popover on selected text. After hydration it
// paints the page's Grifos (`highlight-paint.ts`) and the quotes of the
// Comentários sent from it (`comment-paint.ts`, #441), and paints them again
// when a store or the quotable text changes. A tap on a painted Grifo opens
// its popover; a tap on a Comentário's quote, outside every Grifo, opens the
// Comentário's. Without JS, and on the server, there is nothing.
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { followHighlights, readHighlights } from '#/state/highlights'
import { useSentComments } from '#/state/sent-comments'
import {
  commentOver,
  paintComments,
  paintedCommentAt,
  unpaintComments,
  usePaintedComments,
} from './comment-paint'
import { AlsoCommented, CommentPopover } from './comment-popover'
import {
  onOpenRequest,
  paintedAt,
  paintPage,
  unpaint,
  usePainted,
} from './highlight-paint'
import { HighlightPopover } from './highlight-popover'
import { QUOTABLE } from './quote-text'

/** What a tap on the text lands on, when it is not a control of its own. */
const CONTROL = 'a, button, input, label, [role="dialog"]'

/** The popover open: a Grifo's or a Comentário's, by id. */
type Open = { readonly grifo: string } | { readonly comment: string } | null

/** Whether a DOM change touched the quotable text. */
const touchesText = (records: ReadonlyArray<MutationRecord>) =>
  records.some((record) => {
    const target =
      record.target instanceof Element
        ? record.target
        : record.target.parentElement
    return (
      target?.closest(QUOTABLE) != null ||
      target?.querySelector(QUOTABLE) != null
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

/** Opens what is under a tap, a Grifo before a Comentário, or the Grifo
 * asked for by "Grifar". */
function followTaps(open: (next: Open) => void) {
  const onClick = (event: MouseEvent) => {
    if (!(document.getSelection()?.isCollapsed ?? true)) return
    if (event.target instanceof Element && event.target.closest(CONTROL)) return
    const grifo = paintedAt(event.clientX, event.clientY)
    if (grifo) return open({ grifo: grifo.highlight.id })
    const comment = paintedCommentAt(event.clientX, event.clientY)
    if (comment) open({ comment: comment.comment.id })
  }
  document.addEventListener('click', onClick)
  const stop = onOpenRequest((grifo) => open({ grifo }))
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
  const comments = usePaintedComments()
  const sent = useSentComments()
  const [open, setOpen] = useState<Open>(null)

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
  // The same for the sent Comentários, whose store `sent` follows: a
  // Comentário just sent is marked at once.
  useEffect(() => {
    if (sent === null) return
    const paint = () => paintComments(path)
    paint()
    const stopText = repaintOnChange(paint)
    return () => {
      stopText()
      unpaintComments()
    }
  }, [path, sent])
  useEffect(() => followTaps(setOpen), [])

  const close = () => setOpen(null)
  if (open && 'comment' in open) {
    const shown = comments.find((p) => p.comment.id === open.comment)
    return shown ? <CommentPopover painted={shown} close={close} /> : null
  }
  const shown = open && painted.find((p) => p.highlight.id === open.grifo)
  if (!shown) return null
  const commented = commentOver(comments, shown.whole)
  return (
    <HighlightPopover painted={shown} close={close}>
      {commented && (
        <AlsoCommented
          open={() => setOpen({ comment: commented.comment.id })}
        />
      )}
    </HighlightPopover>
  )
}
