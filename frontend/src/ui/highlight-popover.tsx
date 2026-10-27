// A Grifo's popover (#334), opened by a tap on the painted text or by "Ver
// grifo": the Nota, if there is one, and the actions on the Grifo. "Escrever
// nota" or "Editar nota" opens the Nota's field under the row; "Tirar grifo"
// forgets the Grifo and its Nota; "Copiar" and "Copiar link" are the ones of
// the popover on selected text, over the Grifo's text. Under them, the way
// to `/grifos` (#335).
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
  NOTE_HEADING,
  REMOVE_HIGHLIGHT,
  SAVE_NOTE,
} from './highlight.copy'
import { ALL_HIGHLIGHTS } from './highlight-list.copy'
import type { Painted } from './highlight-paint'
import { SmallLink } from './section'
import { CopyLink, CopyText } from './selection-copy'

/** The Grifo's box, read again each time the popover is placed. */
function anchorOf(range: Range) {
  return {
    getBoundingClientRect: () =>
      range.getBoundingClientRect?.() ?? new DOMRect(),
    contextElement: range.startContainer.parentElement ?? undefined,
  }
}

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

/** The Nota, as the reader wrote it. */
function Note({ note }: { note: string }) {
  return (
    <div className="mb-xs">
      <p className="m-0 text-label text-tinta-2">{NOTE_HEADING}</p>
      <p className="m-0 text-nota leading-nota break-words whitespace-pre-line">
        {note}
      </p>
    </div>
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
  return (
    <>
      {note !== '' && <Note note={note} />}
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
        {quote && <CopyText quote={quote} show={setPanel} close={close} />}
        {quote && <CopyLink quote={quote} show={setPanel} close={close} />}
      </div>
      {panel !== null && <div className="mt-xs">{panel}</div>}
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
      <Popover.Portal>
        <Popover.Positioner
          anchor={anchorOf(painted.whole)}
          side="bottom"
          sideOffset={8}
          collisionPadding={8}
          className="z-20"
        >
          <Popover.Popup
            aria-label={HIGHLIGHT_LABEL}
            className="max-w-88 rounded-mao border-2 border-tinta bg-papel p-xs"
            data-slot="grifo"
          >
            <HighlightActions painted={painted} close={close} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
