// A Grifo's Nota as the reader wrote it (#334), under its heading: in the
// Grifo's popover (`highlight-popover.tsx`) and in the list of `/grifos`
// (`highlight-list.tsx`).
import { NOTE_HEADING } from './highlight.copy'

export function HighlightNote({
  note,
  className,
}: {
  note: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="m-0 text-label text-tinta-2">{NOTE_HEADING}</p>
      <p className="m-0 text-nota leading-nota break-words whitespace-pre-line">
        {note}
      </p>
    </div>
  )
}
