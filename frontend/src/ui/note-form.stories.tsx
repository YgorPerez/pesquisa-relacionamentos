// A Grifo's Nota field (`note-form.tsx`, #440), as the Grifo's popover and
// "Seus trechos" open it: empty, and over a Nota, with "Apagar nota".
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { DELETE_NOTE, NOTE_FIELD, SAVE_NOTE } from './highlight.copy'
import { HighlightNote } from './highlight-note'
import { NoteForm } from './note-form'

/** The field over the Nota it saves, open again after each save. */
function Writing({ note }: { note: string }) {
  const [saved, setSaved] = useState(note)
  const [round, setRound] = useState(0)
  return (
    <>
      {saved !== '' && <HighlightNote note={saved} className="mb-xs" />}
      <NoteForm
        key={round}
        note={saved}
        onSave={setSaved}
        done={() => setRound((n) => n + 1)}
      />
    </>
  )
}

const meta = {
  component: Writing,
  parameters: { layout: 'padded' },
  args: { note: '' },
} satisfies Meta<typeof Writing>

export default meta

type Story = StoryObj<typeof meta>

/** No Nota yet: no "Apagar nota". Salvar saves what was written. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await expect(
      screen.queryByRole('button', { name: DELETE_NOTE }),
    ).not.toBeInTheDocument()
    await userEvent.type(
      screen.getByRole('textbox', { name: NOTE_FIELD }),
      'Ver a amostra',
    )
    await userEvent.click(screen.getByRole('button', { name: SAVE_NOTE }))
    await expect(screen.getByText('Ver a amostra')).toBeVisible()
  },
}

/** Over a Nota: the field starts with it, and "Apagar nota" deletes it. */
export const WithNote: Story = {
  args: { note: 'Conferir a amostra do estudo.' },
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await expect(screen.getByRole('textbox', { name: NOTE_FIELD })).toHaveValue(
      'Conferir a amostra do estudo.',
    )
    await userEvent.click(screen.getByRole('button', { name: DELETE_NOTE }))
    await expect(
      screen.queryByText('Conferir a amostra do estudo.'),
    ).not.toBeInTheDocument()
  },
}
