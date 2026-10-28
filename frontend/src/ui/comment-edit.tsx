// "Editar comentário" (#443, spec #439): in a sent Comentário's popover on
// its page (`comment-popover.tsx`) and under each Comentário of "Seus
// trechos" (`sent-comment-list.tsx`). Only a Comentário still Recebido and
// sent with an edit key has it. The form is the send form's type and text
// (`selection-comment.tsx`), filled with the current ones. The server
// rewrites the issue (ADR 0043); once it did, the record on this device
// takes the new type and text, and the page and the list follow the store.
// A closed issue cannot be edited: the button goes and a line says why, and
// the next status check brings the new status. A failure keeps the form
// and what was typed.
import { useState, type FormEvent, type ReactNode } from 'react'
import type { CommentKind } from '#/content/comment-kinds'
import type { CommentStatus } from '#/content/comment-status'
import { SiteButton } from './button'
import { CLOSED, EDIT_COMMENT, FAILED, SAVE, SAVING } from './comment-edit.copy'
import { CANCEL } from './highlight.copy'
import { missing, saveCommentEdit } from './comment-send'
import { CommentFields, FormProblem } from './selection-comment'
import { PopoverLine } from './text-popover'

/** What the edit needs of a sent Comentário (`SentComment`). */
interface Editable {
  readonly id: string
  readonly kind: CommentKind
  readonly comment: string
  readonly status?: CommentStatus
  readonly editKey?: string
}

/** Recebido, and sent with an edit key (#442). */
const editable = ({ status, editKey }: Editable) =>
  editKey !== undefined && (status ?? 'received') === 'received'

type Step = 'shut' | 'open' | 'closed'

function EditForm({
  comment,
  done,
}: {
  comment: Editable
  done: (step: Step) => void
}) {
  // What the reader changed; the rest shows the Comentário as it is.
  const [draft, setDraft] = useState<{ kind?: CommentKind; text?: string }>({})
  const kind = draft.kind ?? comment.kind
  const text = draft.text ?? comment.comment
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const save = async (event: FormEvent) => {
    event.preventDefault()
    const gap = missing(kind, text)
    setProblem(gap)
    if (gap) return
    setSaving(true)
    const reply = await saveCommentEdit(comment.id, kind, text).finally(() =>
      setSaving(false),
    )
    if (reply === 'failed') return setProblem(FAILED)
    done(reply === 'closed' ? 'closed' : 'shut')
  }

  return (
    <form className="flex flex-col gap-xs" onSubmit={save} noValidate>
      <CommentFields
        kind={kind}
        text={text}
        onKind={(next) => setDraft((now) => ({ ...now, kind: next }))}
        onText={(next) => setDraft((now) => ({ ...now, text: next }))}
      />
      {problem && <FormProblem>{problem}</FormProblem>}
      <div className="flex flex-wrap gap-xs">
        <SiteButton type="submit" disabled={saving}>
          {saving ? SAVING : SAVE}
        </SiteButton>
        <SiteButton variant="light" type="button" onClick={() => done('shut')}>
          {CANCEL}
        </SiteButton>
      </div>
    </form>
  )
}

/** "Editar comentário" and, under the row it sits in, its form; nothing
 * for a Comentário that cannot be edited. `children` are the row's other
 * buttons, after it; `label` names the Comentário where there are several. */
export function CommentEdit({
  comment,
  label,
  className,
  children,
}: {
  comment: Editable
  label?: string
  className?: string
  children?: ReactNode
}) {
  const [step, setStep] = useState<Step>('shut')
  if (step === 'closed')
    return (
      <>
        {children}
        <PopoverLine role="status" className="basis-full">
          {CLOSED}
        </PopoverLine>
      </>
    )
  if (!editable(comment)) return children
  return (
    <>
      <SiteButton
        variant="light"
        className={className}
        aria-label={label}
        aria-expanded={step === 'open'}
        onClick={() => setStep(step === 'open' ? 'shut' : 'open')}
      >
        {EDIT_COMMENT}
      </SiteButton>
      {children}
      {step === 'open' && (
        <div className="mt-xs basis-full">
          <EditForm comment={comment} done={setStep} />
        </div>
      )}
    </>
  )
}
