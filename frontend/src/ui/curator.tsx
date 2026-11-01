import { useState } from 'react'
import { issueLink } from '#/content/comment-issue'
import type {
  CuratorComment,
  CuratorDecision,
  CuratorDesk,
} from '#/content/public-comment-record'
import { decideComment } from '#/content/public-comments'
import { SiteButton as Button } from './button'
import { CommentQuote } from './comment-quote'
import { CURATOR as COPY } from './curator.copy'
import { Headline, Section } from './section'
import { Column, Display, Lead, Sheet } from './sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './shadcn/collapsible'
import { useHydrated } from './use-hydrated'

/** One time zone, so the server and the browser write the same date. */
const DATE = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
})

function CommentState({ comment }: { comment: CuratorComment }) {
  const { hidden, reports, issue, notifyFailed, parentId, editedAt } = comment
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-sm p-0 text-nota font-bold">
      {hidden && <li>{COPY.hidden}</li>}
      {reports > 0 && <li>{COPY.reports(reports)}</li>}
      {parentId !== null && <li>{COPY.reply}</li>}
      {editedAt !== null && <li>{COPY.edited}</li>}
      {issue !== null && (
        <li>
          <a href={issueLink(issue)}>{COPY.issue(issue)}</a>
        </li>
      )}
      {notifyFailed && <li>{COPY.notifyFailed}</li>}
    </ul>
  )
}

function CommentHistory({ history }: { history: CuratorComment['history'] }) {
  if (!history.length) return null
  return (
    <Collapsible className="my-xs">
      <CollapsibleTrigger>{COPY.history(history.length)}</CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="m-0 list-none p-0">
          {history.map((version) => (
            <li key={version.replacedAt} className="py-xs">
              <p className="m-0 text-nota text-tinta-2">
                {COPY.replaced} {DATE.format(version.replacedAt)}
              </p>
              <p className="m-0 whitespace-pre-wrap wrap-anywhere">
                {version.body}
              </p>
            </li>
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  )
}

function RemoveQuestion({
  busy,
  onConfirm,
  onCancel,
}: {
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <>
      <p className="m-0 w-full text-nota">{COPY.removeQuestion}</p>
      <Button variant="light" disabled={busy} onClick={onConfirm}>
        {COPY.removeConfirm}
      </Button>
      <Button variant="light" onClick={onCancel}>
        {COPY.cancel}
      </Button>
    </>
  )
}

function CommentDecisions({
  comment,
  pending,
  onChanged,
}: {
  comment: CuratorComment
  pending: boolean
  onChanged: () => void
}) {
  const [removing, setRemoving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  async function decide(action: CuratorDecision['action']) {
    setBusy(true)
    setProblem('')
    try {
      const result = await decideComment({
        data: { action, id: comment.id },
      })
      if (result.ok) onChanged()
      else setProblem(result.problem)
    } catch {
      setProblem(COPY.failed)
    }
    setBusy(false)
  }
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {removing ? (
        <RemoveQuestion
          busy={busy}
          onConfirm={() => void decide('remove')}
          onCancel={() => setRemoving(false)}
        />
      ) : (
        <>
          {pending && (
            <Button disabled={busy} onClick={() => void decide('restore')}>
              {comment.hidden ? COPY.restore : COPY.keep}
            </Button>
          )}
          <Button variant="light" onClick={() => setRemoving(true)}>
            {COPY.remove}
          </Button>
        </>
      )}
      {problem && (
        <p role="alert" className="m-0 w-full">
          {problem}
        </p>
      )}
    </div>
  )
}

function CuratorEntry({
  comment,
  pending,
  onChanged,
}: {
  comment: CuratorComment
  pending: boolean
  onChanged: () => void
}) {
  const hydrated = useHydrated()
  return (
    <article
      id={`comentario-${comment.id}`}
      className="flex flex-col gap-xs border-t border-tinta py-sm"
    >
      <p className="m-0 text-label font-bold wrap-anywhere">
        {comment.nickname}
      </p>
      <p className="m-0 text-nota text-tinta-2 wrap-anywhere">
        {DATE.format(comment.createdAt)},{' '}
        <a href={`${comment.path}#comentario-${comment.id}`}>{comment.path}</a>
      </p>
      <CommentState comment={comment} />
      <CommentQuote className="wrap-anywhere">{comment.quote}</CommentQuote>
      <p className="m-0 whitespace-pre-wrap wrap-anywhere">{comment.body}</p>
      <CommentHistory history={comment.history} />
      {hydrated && (
        <CommentDecisions
          comment={comment}
          pending={pending}
          onChanged={onChanged}
        />
      )}
    </article>
  )
}

function Comments({
  comments,
  pending,
  empty,
  onChanged,
}: {
  comments: CuratorComment[]
  pending: boolean
  empty: string
  onChanged: () => void
}) {
  if (!comments.length) return <p>{empty}</p>
  return comments.map((comment) => (
    <CuratorEntry
      key={comment.id}
      comment={comment}
      pending={pending}
      onChanged={onChanged}
    />
  ))
}

/** `/curadoria`. The server sends a `desk` to the curator only (ADR 0047). */
export function CuratorPage({
  desk,
  older = false,
  onChanged,
}: {
  desk: CuratorDesk | null
  /** Whether this is a page past the newest comments. */
  older?: boolean
  onChanged: () => void
}) {
  return (
    <Sheet>
      <Column>
        <Display>{COPY.title}</Display>
        {desk ? (
          <>
            <Lead>{COPY.lead}</Lead>
            <Section aria-labelledby="curator-pending">
              <Headline id="curator-pending">{COPY.pending}</Headline>
              <Comments
                comments={desk.pending}
                pending
                empty={COPY.nothingPending}
                onChanged={onChanged}
              />
            </Section>
            <Section aria-labelledby="curadoria-outros">
              <Headline id="curadoria-outros">{COPY.others}</Headline>
              <Comments
                comments={desk.recent}
                pending={false}
                empty={COPY.noOthers}
                onChanged={onChanged}
              />
              <p className="flex flex-wrap gap-sm">
                {older && <a href="/curadoria">{COPY.newest}</a>}
                {desk.before !== null && (
                  <a href={`/curadoria?antes=${desk.before}`}>{COPY.older}</a>
                )}
              </p>
            </Section>
          </>
        ) : (
          <Section>
            <p>{COPY.denied}</p>
            <a href="/conta" className="font-bold">
              {COPY.toAccount}
            </a>
          </Section>
        )}
      </Column>
    </Sheet>
  )
}
