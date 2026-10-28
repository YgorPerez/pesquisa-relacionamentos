// "Comentar" of the popover on selected text (#337, ADR 0043): an anonymous
// message from the reader to the curator. The form asks for a type and the
// text; the quote, its link and the page's title go along by themselves,
// and there is no contact field. The server opens an issue in the private
// sources repo (`content/comment.ts`). On touch the form opens in a sheet at
// the bottom of the screen (#345). Once sent, this browser keeps the comment
// with its issue's number (`state/sent-comments.ts`, #347), the popover or
// the sheet closes and a notice says so, with a link to "Seus trechos"; a
// failure keeps what was typed and keeps nothing. The count carries the
// action's name only, once a comment is sent.
import { useId, useState, type FormEvent } from 'react'
import { sendComment } from '#/content/comment'
import { addSentComment } from '#/state/sent-comments'
import {
  COMMENT_KINDS,
  COMMENT_LIMITS,
  KIND_LABEL,
  type CommentKind,
} from '#/content/comment-kinds'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { Textarea } from '@/ui/shadcn/textarea'
// The form's "Enviar" is the yellow shadcn `Button`, as `SiteButton`
// (`button.tsx`) renders it: that module's fan-in is at the limit.
import { Button } from '@/ui/shadcn/button'
import { pageText, quoteInPage } from './highlight-text'
import { ActionButton } from './selection-button'
import { COMMENT } from './selection-comment.copy'
import { countSelection } from './selection-count'
import { ACTION_LABEL } from './selection-popover.copy'
import type { Quote, SelectionActionProps } from './selection-action'
import { pageTitle } from './quote-text'
import { PopoverLine } from './text-popover'

type Status = 'editing' | 'sending' | 'failed'

/** What is missing before the form can go, or `null`. */
function missing(kind: CommentKind | null, text: string) {
  if (!kind) return COMMENT.missingKind
  if (!text.trim()) return COMMENT.missingText
  return null
}

/** Sends the comment; the issue's number only when the server says it
 * went. */
async function send(
  quote: Quote,
  kind: CommentKind,
  text: string,
  website: string,
) {
  try {
    const reply = await sendComment({
      data: {
        kind,
        text,
        quote: quote.text.slice(0, COMMENT_LIMITS.quote),
        link: quote.link,
        page: pageTitle().slice(0, COMMENT_LIMITS.page),
        website,
      },
    })
    return reply.sent ? reply.issue : null
  } catch {
    return null
  }
}

/** What this browser keeps of the comment about to go (#347): the quote as
 * a Grifo keeps it, read before the send, while the page is as the reader
 * saw it. */
function toKeep(quote: Quote, kind: CommentKind, text: string) {
  const where = quoteInPage(pageText(), quote.range)
  return (issue: number) =>
    addSentComment({
      exact: where?.exact ?? quote.text.replace(/\s+/g, ' ').trim(),
      prefix: where?.prefix ?? '',
      suffix: where?.suffix ?? '',
      path: quote.path,
      pageTitle: pageTitle() || quote.path,
      link: quote.link.slice(new URL(quote.link).origin.length),
      text: quote.text,
      kind,
      comment: text.trim(),
      issue,
    })
}

/** A field no reader sees nor reaches with Tab; a bot that fills every
 * field fills it too, and the server drops that comment. */
function Honeypot({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="sr-only" aria-hidden="true">
      <label>
        {COMMENT.honeypot}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </label>
    </div>
  )
}

const FIELD_LABEL = 'm-0 text-label leading-nota font-bold'

/** The four types, one to pick. */
function KindChoice({
  kind,
  onPick,
}: {
  kind: CommentKind | null
  onPick: (kind: CommentKind) => void
}) {
  const id = useId()
  return (
    <>
      <p id={id} className={FIELD_LABEL}>
        {COMMENT.kind}
      </p>
      <RadioGroup
        aria-labelledby={id}
        value={kind}
        onValueChange={(value) => onPick(value as CommentKind)}
      >
        {COMMENT_KINDS.map((value) => (
          <RadioGroupItem key={value} value={value}>
            {KIND_LABEL[value]}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </>
  )
}

/** The free text, up to the server's limit. */
function TextField({
  text,
  onChange,
}: {
  text: string
  onChange: (text: string) => void
}) {
  const id = useId()
  return (
    <>
      <label htmlFor={id} className={FIELD_LABEL}>
        {COMMENT.text}
      </label>
      <Textarea
        id={id}
        value={text}
        maxLength={COMMENT_LIMITS.text}
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    </>
  )
}

function CommentForm({ quote, onSent }: { quote: Quote; onSent: () => void }) {
  const [kind, setKind] = useState<CommentKind | null>(null)
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('editing')
  const [problem, setProblem] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const gap = missing(kind, text)
    setProblem(gap)
    if (gap || !kind) return
    setStatus('sending')
    const keep = toKeep(quote, kind, text)
    const issue = await send(quote, kind, text, website)
    if (issue === null) return setStatus('failed')
    keep(issue)
    countSelection('comment')
    onSent()
  }

  return (
    <form className="flex flex-col gap-xs" onSubmit={submit} noValidate>
      <blockquote className="m-0 line-clamp-3 border-l-2 border-tinta pl-xs text-nota text-tinta-2">
        {quote.text}
      </blockquote>
      <KindChoice kind={kind} onPick={setKind} />
      <TextField text={text} onChange={setText} />
      <Honeypot value={website} onChange={setWebsite} />
      <PopoverLine>{COMMENT.anonymous}</PopoverLine>
      {(problem ?? status === 'failed') && (
        <p role="alert" className={FIELD_LABEL}>
          {problem ?? COMMENT.failed}
        </p>
      )}
      <div>
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? COMMENT.sending : COMMENT.send}
        </Button>
      </div>
    </form>
  )
}

/** "Comentar": opens the form under the row of actions, or in a sheet on
 * touch. */
export function CommentOnQuote({
  quote,
  showForm,
  finish,
}: SelectionActionProps) {
  const open = () =>
    showForm(
      ACTION_LABEL.comment,
      <CommentForm
        quote={quote}
        onSent={() =>
          finish(COMMENT.sent, { to: '/trechos', label: COMMENT.seeSent })
        }
      />,
    )
  return <ActionButton onClick={open}>{ACTION_LABEL.comment}</ActionButton>
}
