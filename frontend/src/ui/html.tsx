// The HTML the server already built from the library's Markdown, filtered by
// `content/safe-html.ts`: the only place that puts HTML on the page. It
// lives alone so the pieces that draw library text import just this; the
// Guide's pieces re-export it (`guide.tsx`).
import type { SafeHtml } from '#/content/safe-html'
import { quotable } from './selection-quote'

export function Html({
  html,
  as = 'div',
  className,
  slot,
  quote,
}: {
  html: SafeHtml
  as?: 'div' | 'span' | 'p'
  className?: string
  /** The `data-slot`, by which the test finds the block. */
  slot?: string
  /** Text the selection popover quotes, with the anchor of its section
   * (`null` at the top of the page); without it, not quoted. */
  quote?: string | null
}) {
  const Tag = as
  return (
    <Tag
      className={className}
      data-slot={slot}
      {...(quote === undefined ? {} : quotable(quote))}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
