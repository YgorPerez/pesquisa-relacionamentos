import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { readAccount } from '#/content/account'
import type {
  PublicComment,
  PublicCommentWrite,
} from '#/content/public-comment-record'
import {
  readPublicComments,
  writePublicComment,
} from '#/content/public-comments'
import { SiteButton as Button } from './button'
import { Textarea } from './shadcn/textarea'
import { RadioGroup, RadioGroupItem } from './shadcn/radio-group'
import { Headline, Section } from './section'
import { findQuote, pageText } from './highlight-text'
import { canPaint } from './highlight-paint'
import { PUBLIC_COMMENT as COPY } from './public-comments.copy'

function PublicCommentForm({
  input,
  onDone,
}: {
  input: Exclude<PublicCommentWrite, { action: 'delete' }>
  onDone: () => void
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setProblem('')
    try {
      const body = new FormData(event.currentTarget).get('body')
      const text = typeof body === 'string' ? body : ''
      await writePublicComment({ data: { ...input, body: text } })
      window.dispatchEvent(new Event('public-comments-changed'))
      onDone()
    } catch {
      setProblem(COPY.failed)
    }
    setBusy(false)
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-xs">
      <label htmlFor={id} className="text-label font-bold">
        {COPY.text}
      </label>
      <Textarea
        id={id}
        name="body"
        defaultValue={input.body}
        required
        maxLength={4000}
      />
      <p className="m-0 text-nota text-tinta-2">{COPY.rules}</p>
      {problem && <p role="alert">{problem}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? COPY.sending : input.action === 'edit' ? COPY.save : COPY.send}
      </Button>
    </form>
  )
}

export function CommentAudience({
  children,
  path,
  quote,
  onDone,
}: {
  children: ReactNode
  path: string
  quote: string
  onDone: () => void
}) {
  const [signedIn, setSignedIn] = useState(false)
  const [audience, setAudience] = useState('private')
  useEffect(() => {
    let active = true
    void readAccount()
      .then((account) => {
        if (active) setSignedIn(Boolean(account?.nickname))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return (
    <div className="flex flex-col gap-xs">
      {signedIn && (
        <RadioGroup
          aria-label={COPY.audience}
          value={audience}
          onValueChange={(value) => setAudience(String(value))}
        >
          <RadioGroupItem value="private">{COPY.private}</RadioGroupItem>
          <RadioGroupItem value="public">{COPY.public}</RadioGroupItem>
        </RadioGroup>
      )}
      {audience === 'public' ? (
        <PublicCommentForm
          input={{ action: 'publish', path, quote, body: '' }}
          onDone={onDone}
        />
      ) : (
        children
      )}
    </div>
  )
}

function useConversation(path: string, comments: PublicComment[]) {
  const [updated, setItems] = useState<PublicComment[] | null>(null)
  const items = updated ?? comments
  const [problem, setProblem] = useState('')
  useEffect(() => {
    let active = true
    const refresh = () => {
      void readPublicComments({ data: path })
        .then((next) => {
          if (active) setItems(next)
        })
        .catch(() => {
          if (active) setProblem(COPY.failed)
        })
    }
    window.addEventListener('public-comments-changed', refresh)
    return () => {
      active = false
      window.removeEventListener('public-comments-changed', refresh)
    }
  }, [path])
  return { items, problem }
}

function useCommentMarks(items: PublicComment[]) {
  useEffect(() => {
    const paint = () => {
      const page = pageText()
      const found = items.flatMap(
        (comment) =>
          findQuote(page, { exact: comment.quote, prefix: '', suffix: '' })
            ?.parts ?? [],
      )
      if (canPaint())
        CSS.highlights.set(
          'comentario-publico',
          new globalThis.Highlight(...found),
        )
    }
    paint()
    const observer = new MutationObserver(paint)
    document.querySelectorAll('[data-quote]').forEach((node) =>
      observer.observe(node, {
        subtree: true,
        childList: true,
        characterData: true,
      }),
    )
    return () => {
      observer.disconnect()
      if (canPaint()) CSS.highlights.delete('comentario-publico')
    }
  }, [items])
}

export function PublicComments({
  path,
  comments,
}: {
  path: string
  comments: PublicComment[]
}) {
  const { items, problem } = useConversation(path, comments)
  const signedIn = items.some((comment) => comment.canReply)
  useCommentMarks(items)
  if (!items.length) return null
  return (
    <Section aria-labelledby="comentarios-publicos">
      <Headline id="comentarios-publicos">{COPY.title}</Headline>
      {problem && <p role="alert">{problem}</p>}
      {items
        .filter((comment) => comment.parentId === null)
        .map((comment) => (
          <div key={comment.id} className="border-t border-tinta">
            <CommentEntry path={path} comment={comment} signedIn={signedIn} />
            <div className="pl-md">
              {items
                .filter((reply) => reply.parentId === comment.id)
                .map((reply) => (
                  <CommentEntry
                    key={reply.id}
                    path={path}
                    comment={reply}
                    signedIn={signedIn}
                  />
                ))}
            </div>
          </div>
        ))}
    </Section>
  )
}

function CommentEntry({
  path,
  comment,
  signedIn,
}: {
  path: string
  comment: PublicComment
  signedIn: boolean
}) {
  const [editing, setEditing] = useState<{ id: number; reply: boolean } | null>(
    null,
  )
  const [problem, setProblem] = useState('')
  async function remove(id: number) {
    try {
      await writePublicComment({ data: { action: 'delete', id } })
      window.dispatchEvent(new Event('public-comments-changed'))
    } catch {
      setProblem(COPY.failed)
    }
  }
  return (
    <article id={`comentario-${comment.id}`} className="py-sm" key={comment.id}>
      <CommentBody comment={comment} />
      <div className="flex flex-wrap gap-xs">
        {signedIn && comment.parentId === null && (
          <Button
            variant="light"
            onClick={() => setEditing({ id: comment.id, reply: true })}
          >
            {COPY.reply}
          </Button>
        )}
        {comment.own && (
          <>
            <Button
              variant="light"
              onClick={() => setEditing({ id: comment.id, reply: false })}
            >
              {COPY.edit}
            </Button>
            <Button variant="light" onClick={() => void remove(comment.id)}>
              {COPY.delete}
            </Button>
          </>
        )}
      </div>
      {problem && <p role="alert">{problem}</p>}
      {editing?.id === comment.id && (
        <CommentEditor
          path={path}
          comment={comment}
          reply={editing.reply}
          onDone={() => setEditing(null)}
        />
      )}
    </article>
  )
}

function CommentEditor({
  path,
  comment,
  reply,
  onDone,
}: {
  path: string
  comment: PublicComment
  reply: boolean
  onDone: () => void
}) {
  const input: Exclude<PublicCommentWrite, { action: 'delete' }> = reply
    ? {
        action: 'publish',
        path,
        quote: comment.quote,
        parentId: comment.id,
        body: '',
      }
    : { action: 'edit', id: comment.id, body: comment.body }
  return (
    <>
      <PublicCommentForm
        key={`${comment.id}-${reply}`}
        input={input}
        onDone={onDone}
      />
      <Button variant="light" onClick={onDone}>
        {COPY.cancel}
      </Button>
    </>
  )
}

function CommentBody({ comment }: { comment: PublicComment }) {
  return (
    <>
      <p className="m-0 text-label font-bold">
        {comment.nickname}
        {comment.edited && (
          <>
            {' '}
            · <span>{COPY.edited}</span>
          </>
        )}
      </p>
      {comment.parentId === null && (
        <blockquote className="mx-0 my-xs border-l-2 border-tinta pl-xs text-nota text-tinta-2">
          {comment.quote}
          {comment.changed && <p>{COPY.changed}</p>}
        </blockquote>
      )}
      <p className="my-xs whitespace-pre-wrap wrap-anywhere">{comment.body}</p>
    </>
  )
}
