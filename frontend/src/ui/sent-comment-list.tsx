// The Comentários section of "Seus trechos" (`/trechos`, #347): every
// Comentário sent from this browser, newest first. Each shows its type, the
// day it went, its page, its quote leading to its sentence and what the
// reader wrote, "Editar comentário" while it is Recebido
// (`comment-edit.tsx`, #443) and "Tirar da lista", which forgets it here
// only. A
// Comentário whose quote left its page (`changed`, set by that page's layer)
// says so, keeps the old text, and its quote leads to the page. Everything
// comes from the store (`state/sent-comments.ts`).
//
// The quote is a plain `<a>`, as the Grifos' (`highlight-list.tsx`): the
// browser only reads the Text Fragment when it loads a page.
import { KIND_LABEL } from '#/content/comment-kinds'
import { useEffect, useRef, useState } from 'react'
import {
  markCommentStatusesSeen,
  type SentComment,
} from '#/state/sent-comments'
import { CommentEdit } from './comment-edit'
import { editCommentLabel } from './comment-edit.copy'
import {
  ChangedPassageNotice,
  RemoveButton,
  SeparatedListItem,
} from './highlight-list'
import { HighlightNote } from './highlight-note'
import { Headline, Section, Tag } from './section'
import {
  COMMENT_CHANGED_LINE,
  COMMENTS,
  NO_COMMENTS_LINE,
  KEPT_LINE,
  REMOVE_FROM_LIST,
  removeCommentLabel,
  sentCount,
  sentOn,
  YOUR_COMMENT,
  STATUS_LABEL,
  STATUS_UPDATED,
} from './sent-comment-list.copy'

/** Its type, the day it went and its page, over the quote. */
function About({ comment }: { comment: SentComment }) {
  const { kind, at, path, pageTitle } = comment
  return (
    <p className="m-0 mb-xs flex flex-wrap items-center gap-x-sm gap-y-1 text-nota leading-nota text-tinta-2">
      <Tag>{KIND_LABEL[kind]}</Tag>
      <Tag>{STATUS_LABEL[comment.status ?? 'received']}</Tag>
      <time dateTime={new Date(at).toISOString()}>{sentOn(at)}</time>
      <a href={path} className="font-bold text-tinta">
        {pageTitle}
      </a>
    </p>
  )
}

/** Only viewport entry acknowledges a changed status, never mounting alone. */
function useStatusVisibility(id: string, updated: boolean) {
  const item = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const element = item.current
    if (!element || !updated || typeof IntersectionObserver === 'undefined')
      return
    const observer = new IntersectionObserver((entries) => {
      if (
        !entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio > 0,
        )
      )
        return
      markCommentStatusesSeen([id])
      observer.disconnect()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [id, updated])
  return item
}

function SentItem({
  comment,
  onRemove,
}: {
  comment: SentComment
  onRemove: (id: string) => void
}) {
  const { id, link, path, text, changed } = comment
  const [updated] = useState(
    () => (comment.status ?? 'received') !== (comment.seenStatus ?? 'received'),
  )
  const item = useStatusVisibility(id, updated)
  return (
    <SeparatedListItem ref={item} data-slot="comentario-enviado">
      {updated && (
        <p className="m-0 mb-xs border-l-2 border-tinta pl-xs font-bold">
          {STATUS_UPDATED}
        </p>
      )}
      {changed && (
        <ChangedPassageNotice>{COMMENT_CHANGED_LINE}</ChangedPassageNotice>
      )}
      <About comment={comment} />
      <a
        href={changed ? path : link}
        className="block border-l-2 border-tinta pl-xs whitespace-pre-line text-tinta no-underline hover:underline"
        data-slot="trecho"
      >
        {text}
      </a>
      <HighlightNote
        heading={YOUR_COMMENT}
        note={comment.comment}
        className="mt-xs"
      />
      <div className="flex flex-wrap gap-xs">
        <CommentEdit
          comment={comment}
          label={editCommentLabel(text)}
          className="mt-xs"
        >
          <RemoveButton
            label={removeCommentLabel(text)}
            onClick={() => onRemove(id)}
          >
            {REMOVE_FROM_LIST}
          </RemoveButton>
        </CommentEdit>
      </div>
    </SeparatedListItem>
  )
}

/** The Comentários section, or what to do when there is none. */
export function SentCommentList({
  comments,
  onRemove,
}: {
  comments: ReadonlyArray<SentComment>
  onRemove: (id: string) => void
}) {
  const newest = [...comments].sort((a, b) => b.at - a.at)
  return (
    <Section id="comentarios" aria-labelledby="t-comentarios">
      <Headline id="t-comentarios">{COMMENTS}</Headline>
      {newest.length === 0 ? (
        <p className="m-0">{NO_COMMENTS_LINE}</p>
      ) : (
        <>
          <p className="m-0 mb-md text-nota leading-nota text-tinta-2">
            <span className="block">{sentCount(newest.length)}</span>
            {KEPT_LINE}
          </p>
          <ul className="m-0 list-none p-0">
            {newest.map((comment) => (
              <SentItem
                key={`${comment.id}-${comment.status ?? 'received'}`}
                comment={comment}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </>
      )}
    </Section>
  )
}
