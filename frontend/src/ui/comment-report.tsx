import { useState } from 'react'
import { PUBLIC_COMMENTS_CHANGED } from '#/content/public-comment-record'
import { reportPublicComment } from '#/content/public-comments'
import { SiteButton as Button } from './button'
import { COMMENT_REPORT as COPY } from './comment-report.copy'

/** "Denunciar" on someone else's Comentário público (ADR 0047). A tap on a
 * phone is easy to make by accident and a report cannot be taken back, so it
 * asks first. */
export function CommentReport({
  id,
  onProblem,
}: {
  id: number
  onProblem: (problem: string) => void
}) {
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  async function report() {
    setBusy(true)
    onProblem('')
    try {
      const result = await reportPublicComment({ data: id })
      if (result.ok) window.dispatchEvent(new Event(PUBLIC_COMMENTS_CHANGED))
      else onProblem(result.problem)
    } catch {
      onProblem(COPY.failed)
    }
    setBusy(false)
  }
  if (!asking)
    return (
      <Button variant="light" onClick={() => setAsking(true)}>
        {COPY.report}
      </Button>
    )
  return (
    <div className="flex w-full flex-wrap items-center gap-xs">
      <p className="m-0 w-full text-nota">{COPY.question}</p>
      <Button variant="light" disabled={busy} onClick={() => void report()}>
        {busy ? COPY.sending : COPY.confirm}
      </Button>
      <Button variant="light" onClick={() => setAsking(false)}>
        {COPY.cancel}
      </Button>
    </div>
  )
}
