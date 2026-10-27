// A Grifo's popover (#334), opened by a tap on the painted text or by "Ver
// grifo": the Nota, if there is one, and the actions on the Grifo. "Escrever
// nota" or "Editar nota" opens the Nota's field under the row; "Tirar grifo"
// forgets the Grifo and its Nota; "Copiar", "Copiar link" and "De onde vem
// isso?" are the ones of the popover on selected text, over the Grifo's
// text. Under them, the way to `/grifos` (#335).
import { Popover } from '@base-ui/react/popover'
import { useState, type FormEvent, type ReactNode } from 'react'
import { removeHighlight, setNote, NOTE_LENGTH } from '#/state/highlights'
import { Input } from '@/ui/shadcn/input'
import { SiteButton } from './button'
import {
  ADD_NOTE,
  CANCEL,
  DELETE_NOTE,
  EDIT_NOTE,
  HIGHLIGHT_LABEL,
  NOTE_FIELD,
  REMOVE_HIGHLIGHT,
  SAVE_NOTE,
} from './highlight.copy'
import { ALL_HIGHLIGHTS } from './highlight-list.copy'
import { HighlightNote } from './highlight-note'
import type { Painted } from './highlight-paint'
import { SmallLink } from './section'
import { CopyLink, CopyText } from './selection-copy'
import { WhereFrom } from './selection-source'
import { PopoverPanel, TextPopover } from './text-popover'

const NOTE_NAME = 'nota'

/** The Nota's field; an empty Nota is no Nota. */
function NoteForm({
  id,
  note,
  done,
}: {
  id: string
  note: string
  done: () => void
}) {
  // The page stays: the Nota goes to the store, never to a server.
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get(NOTE_NAME)
    setNote(id, typeof value === 'string' ? value : '')
    done()
  }
  return (
    <form onSubmit={save}>
      <Input
        small
        className="w-full"
        name={NOTE_NAME}
        aria-label={NOTE_FIELD}
        defaultValue={note}
        maxLength={NOTE_LENGTH}
        autoFocus
      />
      <div className="mt-xs flex flex-wrap gap-xs">
        <SiteButton type="submit">{SAVE_NOTE}</SiteButton>
        {note !== '' && (
          <SiteButton
            variant="light"
            type="button"
            onClick={() => {
              setNote(id, '')
              done()
            }}
          >
            {DELETE_NOTE}
          </SiteButton>
        )}
        <SiteButton variant="light" type="button" onClick={done}>
          {CANCEL}
        </SiteButton>
      </div>
    </form>
  )
}

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
    setPanel(<NoteForm id={id} note={note} done={() => setPanel(null)} />)
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
      <SmallLink to="/grifos" className="mt-xs">
        {ALL_HIGHLIGHTS}
      </SmallLink>
    </>
  )
}

export function HighlightPopover({
  painted,
  close,
}: {
  painted: Painted
  close: () => void
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
      </TextPopover>
    </Popover.Root>
  )
}
