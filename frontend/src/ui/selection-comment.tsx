// "Comentar" of the popover on selected text (#337, ADR 0043): an anonymous
// message from the reader to the curator. The form asks for a type and the
// text; the quote, its link and the page's title go along by themselves,
// and there is no contact field. The server opens an issue in the private
// sources repo (`content/comment.ts`). A failure keeps what was typed, and
// the count carries the action's name only, once a comment is sent.
import { useId, useState, type FormEvent } from 'react'
import { sendComment } from '#/content/comment'
import {
  COMMENT_KINDS,
  COMMENT_LIMITS,
  KIND_LABEL,
  type CommentKind,
} from '#/content/comment-kinds'
import { RadioGroup, RadioGroupItem } from '@/ui/shadcn/radio-group'
import { Textarea } from '@/ui/shadcn/textarea'
import { SiteButton } from './button'
import { COMMENT } from './selection-comment.copy'
import { countSelection } from './selection-count'
import { ACTION_LABEL } from './selection-popover.copy'
import type { Quote, SelectionActionProps } from './selection-action'

type Status = 'editing' | 'sending' | 'sent' | 'failed'

const NOTE = 'm-0 text-label leading-nota font-normal text-tinta-2'

/** The page's own title, without the site's name after it. */
const pageTitle = () => document.title.split(' · ')[0]!.trim()

/** What is missing before the form can go, or `null`. */
function missing(kind: CommentKind | null, text: string) {
  if (!kind) return COMMENT.missingKind
  if (!text.trim()) return COMMENT.missingText
  return null
}

/** Sends the comment; `true` only when the server says it went. */
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
    return reply.sent
  } catch {
    return false
  }
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

function CommentForm({ quote }: { quote: Quote }) {
  const [kind, setKind] = useState<CommentKind | null>(null)
  const [text, setText] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<Status>('editing')
  const [problem, setProblem] = useState<string | null>(null)

  if (status === 'sent')
    return (
      <p role="status" className={NOTE}>
        {COMMENT.sent}
      </p>
    )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const gap = missing(kind, text)
    setProblem(gap)
    if (gap || !kind) return
    setStatus('sending')
    if (await send(quote, kind, text, website)) {
      countSelection('comment')
      setStatus('sent')
    } else setStatus('failed')
  }

  return (
    <form className="flex flex-col gap-xs" onSubmit={submit} noValidate>
      <KindChoice kind={kind} onPick={setKind} />
      <TextField text={text} onChange={setText} />
      <Honeypot value={website} onChange={setWebsite} />
      <p className={NOTE}>{COMMENT.anonymous}</p>
      {(problem ?? status === 'failed') && (
        <p role="alert" className={FIELD_LABEL}>
          {problem ?? COMMENT.failed}
        </p>
      )}
      <div>
        <SiteButton type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? COMMENT.sending : COMMENT.send}
        </SiteButton>
      </div>
    </form>
  )
}

/** "Comentar": opens the form under the row of actions. */
export function CommentOnQuote({ quote, show }: SelectionActionProps) {
  return (
    <SiteButton
      variant="light"
      onClick={() => show(<CommentForm quote={quote} />)}
    >
      {ACTION_LABEL.comment}
    </SiteButton>
  )
}
