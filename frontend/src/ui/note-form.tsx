// A Grifo's Nota field (#334, #440), with Salvar, Apagar nota and Cancelar:
// in the Grifo's popover (`highlight-popover.tsx`) and under each Grifo of
// "Seus trechos" (`highlight-list.tsx`).
import type { FormEvent } from 'react'
import { NOTE_LENGTH } from '#/state/highlights'
import { Input } from '@/ui/shadcn/input'
import { SiteButton } from './button'
import { CANCEL, DELETE_NOTE, NOTE_FIELD, SAVE_NOTE } from './highlight.copy'

const NOTE_NAME = 'nota'

/** The Nota's field; an empty Nota is no Nota. `onSave` gets the new Nota,
 * `''` to delete it; `done` closes the field. */
export function NoteForm({
  note,
  onSave,
  done,
}: {
  note: string
  onSave: (note: string) => void
  done: () => void
}) {
  // The page stays: the Nota goes to the store, never to a server.
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = new FormData(event.currentTarget).get(NOTE_NAME)
    onSave(typeof value === 'string' ? value : '')
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
              onSave('')
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
