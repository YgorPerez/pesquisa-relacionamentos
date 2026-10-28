import { createFileRoute } from '@tanstack/react-router'
import { removeHighlight, setNote, useHighlights } from '#/state/highlights'
import { removeSentComment, useSentComments } from '#/state/sent-comments'
import { HighlightList } from '#/ui/highlight-list'
import {
  KEPT_PASSAGES,
  LEAD,
  NEEDS_JS,
  PAGE_TITLE,
} from '#/ui/highlight-list.copy'
import { SentCommentList } from '#/ui/sent-comment-list'
import { Column, Display, Lead, Sheet } from '#/ui/sheet'

export const Route = createFileRoute('/trechos')({
  head: () => ({
    meta: [
      { title: `${KEPT_PASSAGES} · Tem estudo?` },
      // What is here lives in one browser: there is nothing to index.
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: KeptPassagesPage,
})

/** "Seus trechos" (#335, #347): the Grifos and the sent Comentários of this
 * browser. The server has none of them, so the lists come after hydration;
 * without JS the page says it needs it. `/grifos` leads here. */
function KeptPassagesPage() {
  const highlights = useHighlights()
  const comments = useSentComments()
  return (
    <Sheet>
      <Column>
        <Display>
          {PAGE_TITLE.rest}{' '}
          <span className="marca-texto">{PAGE_TITLE.marked}</span>
        </Display>
        <Lead>{LEAD}</Lead>
        <noscript>
          <p>{NEEDS_JS}</p>
        </noscript>
        {highlights !== null && (
          <HighlightList
            highlights={highlights}
            onNote={setNote}
            onRemove={removeHighlight}
          />
        )}
        {comments !== null && (
          <SentCommentList comments={comments} onRemove={removeSentComment} />
        )}
      </Column>
    </Sheet>
  )
}
