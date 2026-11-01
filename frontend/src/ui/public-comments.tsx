import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { readAccount } from '#/content/account'
import {
  PUBLIC_COMMENTS_CHANGED,
  type PublicComment,
  type PublicCommentWrite,
} from '#/content/public-comment-record'
import {
  readPublicComments,
  writePublicComment,
} from '#/content/public-comments'
import { SiteButton as Button } from './button'
import { CommentQuote } from './comment-quote'
import { CommentReport } from './comment-report'
import { COMMENT_REPORT as REPORT_COPY } from './comment-report.copy'
import { Textarea } from './shadcn/textarea'
import { RadioGroup, RadioGroupItem } from './shadcn/radio-group'
import { Headline, Section } from './section'
import { findQuote, pageText } from './highlight-text'
import { canPaint } from './highlight-paint'
import { PUBLIC_COMMENT as COPY } from './public-comments.copy'
import { QUOTABLE } from './quote-text'
import { Column } from './sheet'
import { useHydrated } from './use-hydrated'

function PublicCommentForm({
  input,
  onDone,
  onText,
}: {
  input: Exclude<PublicCommentWrite, { action: 'delete' }>
  onDone: () => void
  onText?: (text: string) => void
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [startingText] = useState(input.body)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setProblem('')
    try {
      const body = new FormData(event.currentTarget).get('body')
      const text = typeof body === 'string' ? body : ''
      const result = await writePublicComment({
        data: { ...input, body: text },
      })
      if (result.ok) {
        window.dispatchEvent(new Event(PUBLIC_COMMENTS_CHANGED))
        onDone()
      } else setProblem(result.problem)
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
        defaultValue={startingText}
        onChange={(event) => onText?.(event.currentTarget.value)}
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

/** What publishing still asks of this reader. In another tab, so this form and
 * what was typed in it stay; `CommentAudience` looks again on the way back. */
function PublishNeedsAccount({ hasAccount }: { hasAccount: boolean }) {
  return (
    <>
      <p className="m-0 text-nota">
        {hasAccount ? COPY.needsNickname : COPY.needsAccount}
      </p>
      <a
        href={hasAccount ? '/conta' : '/auth/google'}
        target="_blank"
        rel="noopener"
        className="inline-flex min-h-toque items-center font-bold"
      >
        {hasAccount ? COPY.chooseNickname : COPY.signIn}
        <span className="sr-only">{COPY.newTab}</span>
      </a>
    </>
  )
}

/** Who reads this comment: the curator, the default, which needs no account; or
 * everyone, which needs one with a nickname. The text goes along when the choice
 * changes. */
export function CommentAudience({
  children,
  path,
  quote,
  onDone,
}: {
  children: (draft: {
    text: string
    onText: (text: string) => void
  }) => ReactNode
  path: string
  quote: string
  onDone: () => void
}) {
  const [account, setAccount] = useState<{ nickname: string | null } | null>(
    null,
  )
  const [audience, setAudience] = useState('private')
  const [text, setText] = useState('')
  useEffect(() => {
    let active = true
    const look = () => {
      void readAccount()
        .then((next) => {
          if (active) setAccount(next)
        })
        .catch(() => {})
    }
    look()
    window.addEventListener('focus', look)
    return () => {
      active = false
      window.removeEventListener('focus', look)
    }
  }, [])
  return (
    <div className="flex flex-col gap-xs">
      <RadioGroup
        aria-label={COPY.audience}
        value={audience}
        onValueChange={(value) => setAudience(String(value))}
      >
        <RadioGroupItem value="private">{COPY.private}</RadioGroupItem>
        <RadioGroupItem value="public">{COPY.public}</RadioGroupItem>
      </RadioGroup>
      {audience !== 'public' ? (
        children({ text, onText: setText })
      ) : account?.nickname ? (
        <>
          <CommentQuote className="line-clamp-3">{quote}</CommentQuote>
          <PublicCommentForm
            input={{ action: 'publish', path, quote, body: text }}
            onDone={onDone}
            onText={setText}
          />
        </>
      ) : (
        <PublishNeedsAccount hasAccount={account !== null} />
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
    window.addEventListener(PUBLIC_COMMENTS_CHANGED, refresh)
    return () => {
      active = false
      window.removeEventListener(PUBLIC_COMMENTS_CHANGED, refresh)
    }
  }, [path])
  return { items, problem }
}

/** Marks the passage of each comment while the page's text can change, and
 * tells `onFound` which comments it found. Returns how to stop. */
function watchMarks(
  items: PublicComment[],
  onFound: (found: ReadonlySet<number>) => void,
) {
  const quoted = items.filter((comment) => comment.parentId === null)
  const paint = () => {
    // Most pages have none: no need to read the page's text.
    const page = quoted.length ? pageText() : null
    const located = quoted.flatMap((comment) => {
      const where =
        page &&
        findQuote(page, { exact: comment.quote, prefix: '', suffix: '' })
      return where ? [{ id: comment.id, parts: where.parts }] : []
    })
    onFound(new Set(located.map(({ id }) => id)))
    if (canPaint())
      CSS.highlights.set(
        'public-comment',
        new globalThis.Highlight(...located.flatMap(({ parts }) => parts)),
      )
  }
  paint()
  const observer = new MutationObserver(paint)
  document.querySelectorAll(QUOTABLE).forEach((node) =>
    observer.observe(node, {
      subtree: true,
      childList: true,
      characterData: true,
    }),
  )
  return () => {
    observer.disconnect()
    if (canPaint()) CSS.highlights.delete('public-comment')
  }
}

/** Which comments the page itself shows the passage of; `null` until it has
 * been read, when only the server's answer exists. */
function useCommentMarks(items: PublicComment[]) {
  const [found, setFound] = useState<ReadonlySet<number> | null>(null)
  useEffect(() => watchMarks(items, setFound), [items])
  return found
}

export function PublicComments({
  path,
  comments,
}: {
  path: string
  comments: PublicComment[]
}) {
  const { items: listed, problem } = useConversation(path, comments)
  const hydrated = useHydrated()
  const found = useCommentMarks(listed)
  const items = found
    ? listed.map((comment) => ({ ...comment, changed: !found.has(comment.id) }))
    : listed
  const signedIn = hydrated && items.some((comment) => comment.canReply)
  if (!items.length) return null
  return (
    <Column>
      <Section aria-labelledby="comentarios-publicos">
        <Headline id="comentarios-publicos">{COPY.title}</Headline>
        {problem && <p role="alert">{problem}</p>}
        {items
          .filter((comment) => comment.parentId === null)
          .map((comment) => (
            <div key={comment.id} className="border-t border-tinta">
              <CommentEntry
                path={path}
                comment={comment}
                signedIn={signedIn}
                hydrated={hydrated}
              />
              <div className="pl-md">
                {items
                  .filter((reply) => reply.parentId === comment.id)
                  .map((reply) => (
                    <CommentEntry
                      key={reply.id}
                      path={path}
                      comment={reply}
                      signedIn={signedIn}
                      hydrated={hydrated}
                    />
                  ))}
              </div>
            </div>
          ))}
      </Section>
    </Column>
  )
}

type Editing = { reply: boolean } | null

function CommentActions({
  comment,
  signedIn,
  hydrated,
  onEdit,
  onProblem,
}: {
  comment: PublicComment
  signedIn: boolean
  hydrated: boolean
  onEdit: (editing: Editing) => void
  onProblem: (problem: string) => void
}) {
  async function remove() {
    try {
      const result = await writePublicComment({
        data: { action: 'delete', id: comment.id },
      })
      if (result.ok) window.dispatchEvent(new Event(PUBLIC_COMMENTS_CHANGED))
      else onProblem(result.problem)
    } catch {
      onProblem(COPY.failed)
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {signedIn && comment.parentId === null && (
        <Button variant="light" onClick={() => onEdit({ reply: true })}>
          {COPY.reply}
        </Button>
      )}
      {hydrated && comment.own && (
        <>
          <Button variant="light" onClick={() => onEdit({ reply: false })}>
            {COPY.edit}
          </Button>
          <Button variant="light" onClick={() => void remove()}>
            {COPY.delete}
          </Button>
        </>
      )}
      {signedIn && !comment.own && !comment.reported && (
        <CommentReport id={comment.id} onProblem={onProblem} />
      )}
      {signedIn && comment.reported && (
        <p className="m-0 text-nota text-tinta-2">{REPORT_COPY.reported}</p>
      )}
    </div>
  )
}

function CommentEntry({
  path,
  comment,
  signedIn,
  hydrated,
}: {
  path: string
  comment: PublicComment
  signedIn: boolean
  hydrated: boolean
}) {
  const [editing, setEditing] = useState<Editing>(null)
  const [problem, setProblem] = useState('')
  return (
    <article id={`comentario-${comment.id}`} className="py-sm">
      <CommentBody comment={comment} />
      <CommentActions
        comment={comment}
        signedIn={signedIn}
        hydrated={hydrated}
        onEdit={setEditing}
        onProblem={setProblem}
      />
      {problem && <p role="alert">{problem}</p>}
      {editing && (
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
        <CommentQuote className="my-xs">
          {comment.quote}
          {comment.changed && <p className="m-0 mt-xs">{COPY.changed}</p>}
        </CommentQuote>
      )}
      <p className="my-xs whitespace-pre-wrap wrap-anywhere">{comment.body}</p>
    </>
  )
}
