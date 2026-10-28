// A Grifo's Nota as the reader wrote it (#334), under its heading: in the
// Grifo's popover (`highlight-popover.tsx`) and in "Seus trechos"
// (`highlight-list.tsx`). A sent Comentário's text shows the same way under
// its own heading (`sent-comment-list.tsx`, #347).
import { NOTE_HEADING } from './highlight.copy'

export function HighlightNote({
  note,
  heading = NOTE_HEADING,
  className,
}: {
  note: string
  heading?: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="m-0 text-label text-tinta-2">{heading}</p>
      <p className="m-0 text-nota leading-nota break-words whitespace-pre-line">
        {note}
      </p>
    </div>
  )
}
