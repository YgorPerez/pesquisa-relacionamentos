// A sent Comentário's popover on its page (#441), opened by a tap on its
// dotted underline (`comment-paint.ts`) or by "Ver comentário" in the
// popover of a Grifo over the same passage: the type, the status, what the
// reader wrote, the row for the actions on it ("Editar comentário",
// `comment-edit.tsx`, #443) and the way to "Seus trechos" (`/trechos`). Only this browser
// knows it, as with a Grifo.
import { Popover } from '@base-ui/react/popover'
import type { ReactNode } from 'react'
import { KIND_LABEL } from '#/content/comment-kinds'
import { SiteButton } from './button'
import type { PaintedComment } from './comment-paint'
import {
  ALL_COMMENTS,
  ALSO_COMMENTED,
  COMMENT_LABEL,
  SEE_COMMENT,
} from './comment-popover.copy'
import { HighlightNote } from './highlight-note'
import { SmallLink, Tag } from './section'
import { STATUS_LABEL, YOUR_COMMENT } from './sent-comment-list.copy'
import { PopoverLine, TextPopover } from './text-popover'

export function CommentPopover({
  painted,
  close,
  actions,
}: {
  painted: PaintedComment
  close: () => void
  /** The actions on the Comentário, in a row under its text. */
  actions?: ReactNode
}) {
  const { kind, status, comment } = painted.comment
  return (
    <Popover.Root
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <TextPopover
        range={painted.whole}
        side="bottom"
        sideOffset={8}
        aria-label={COMMENT_LABEL}
        data-slot="comentario"
      >
        <p className="m-0 mb-xs flex flex-wrap gap-xs">
          <Tag>{KIND_LABEL[kind]}</Tag>
          <Tag>{STATUS_LABEL[status ?? 'received']}</Tag>
        </p>
        <HighlightNote heading={YOUR_COMMENT} note={comment} />
        {actions != null && (
          // Empty when no action applies, as for a closed Comentário. It
          // scrolls when the open form has no room (a phone), as a
          // `PopoverPanel` does.
          <div className="mt-xs flex min-h-0 shrink flex-wrap gap-xs overflow-y-auto empty:hidden">
            {actions}
          </div>
        )}
        <SmallLink to="/trechos" hash="comentarios" className="mt-xs">
          {ALL_COMMENTS}
        </SmallLink>
      </TextPopover>
    </Popover.Root>
  )
}

/** In a Grifo's popover: the passage has a Comentário too, and the way to
 * it. */
export function AlsoCommented({ open }: { open: () => void }) {
  return (
    <div className="mt-xs flex flex-wrap items-center gap-xs">
      <PopoverLine>{ALSO_COMMENTED}</PopoverLine>
      <SiteButton variant="light" onClick={open}>
        {SEE_COMMENT}
      </SiteButton>
    </div>
  )
}
