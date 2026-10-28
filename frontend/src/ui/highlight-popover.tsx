// A Grifo's popover (#334), opened by a tap on the painted text or by "Ver
// grifo": the Nota, if there is one, and the actions on the Grifo. "Escrever
// nota" or "Editar nota" opens the Nota's field under the row; "Tirar grifo"
// forgets the Grifo and its Nota; "Copiar", "Copiar link" and "De onde vem
// isso?" are the ones of the popover on selected text, over the Grifo's
// text. Under them, the way to "Seus trechos" (`/trechos`, #335).
import { Popover } from '@base-ui/react/popover'
import { useState, type ReactNode } from 'react'
import { removeHighlight, setNote } from '#/state/highlights'
import { SiteButton } from './button'
import {
  ADD_NOTE,
  EDIT_NOTE,
  HIGHLIGHT_LABEL,
  REMOVE_HIGHLIGHT,
} from './highlight.copy'
import { ALL_HIGHLIGHTS } from './highlight-list.copy'
import { HighlightNote } from './highlight-note'
import { NoteForm } from './note-form'
import type { Painted } from './highlight-paint'
import { SmallLink } from './section'
import { CopyLink, CopyText } from './selection-copy'
import { WhereFrom } from './selection-source'
import { PopoverPanel, TextPopover } from './text-popover'

/** The row of actions on the Grifo, and the panel under it. */
function HighlightActions({
  painted,
  close,
}: {
  painted: Painted
  close: () => void
}) {
  const [panel, setPanel] = useState<ReactNode>(null)
  const { highlight, quote } = painted
  const { id, note } = highlight
  const editNote = () =>
    setPanel(
      <NoteForm
        note={note}
        onSave={(next) => setNote(id, next)}
        done={() => setPanel(null)}
      />,
    )
  const onQuote = quote && { quote, show: setPanel, close }
  return (
    <>
      {note !== '' && <HighlightNote note={note} className="mb-xs" />}
      <div className="flex flex-wrap gap-xs">
        <SiteButton variant="light" onClick={editNote}>
          {note === '' ? ADD_NOTE : EDIT_NOTE}
        </SiteButton>
        <SiteButton
          variant="light"
          onClick={() => {
            removeHighlight(id)
            close()
          }}
        >
          {REMOVE_HIGHLIGHT}
        </SiteButton>
        {onQuote && <CopyText {...onQuote} />}
        {onQuote && <CopyLink {...onQuote} />}
        {onQuote && <WhereFrom {...onQuote} />}
      </div>
      {panel !== null && <PopoverPanel>{panel}</PopoverPanel>}
      <SmallLink to="/trechos" className="mt-xs">
        {ALL_HIGHLIGHTS}
      </SmallLink>
    </>
  )
}

export function HighlightPopover({
  painted,
  close,
  children,
}: {
  painted: Painted
  close: () => void
  /** Under the actions: the passage's Comentário, if it has one (#441). */
  children?: ReactNode
}) {
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
        aria-label={HIGHLIGHT_LABEL}
        data-slot="grifo"
      >
        <HighlightActions painted={painted} close={close} />
        {children}
      </TextPopover>
    </Popover.Root>
  )
}
