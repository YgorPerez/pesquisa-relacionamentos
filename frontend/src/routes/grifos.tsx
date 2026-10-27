import { createFileRoute } from '@tanstack/react-router'
import { removeHighlight, useHighlights } from '#/state/highlights'
import { HighlightList } from '#/ui/highlight-list'
import { HIGHLIGHTS, LEAD, NEEDS_JS, TITLE } from '#/ui/highlight-list.copy'
import { Column, Display, Lead, Sheet } from '#/ui/sheet'

export const Route = createFileRoute('/grifos')({
  head: () => ({
    meta: [
      { title: `${HIGHLIGHTS} · Tem estudo?` },
      // What is here lives in one browser: there is nothing to index.
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: HighlightsPage,
})

/** `/grifos` (#335): the Grifos of this browser. The server has none, so the
 * list comes after hydration; without JS the page says it needs it. */
function HighlightsPage() {
  const highlights = useHighlights()
  return (
    <Sheet>
      <Column>
        <Display>
          {TITLE.rest} <span className="marca-texto">{TITLE.marked}</span>
        </Display>
        <Lead>{LEAD}</Lead>
        <noscript>
          <p>{NEEDS_JS}</p>
        </noscript>
        {highlights !== null && (
          <HighlightList highlights={highlights} onRemove={removeHighlight} />
        )}
      </Column>
    </Sheet>
  )
}
