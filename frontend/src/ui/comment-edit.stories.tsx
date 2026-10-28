// "Editar comentário" (`comment-edit.tsx`, #443): the button of a Recebido
// Comentário, its form open with the current type and text, and a Comentário
// that can no longer be edited. Saving, which reaches the server, is the
// jsdom test's (`highlight-layer.test.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CommentEdit } from './comment-edit'
import { EDIT_COMMENT } from './comment-edit.copy'
import { COMMENT } from './selection-comment.copy'

const meta = {
  component: CommentEdit,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex max-w-texto flex-wrap gap-xs">
        <Story />
      </div>
    ),
  ],
  args: {
    comment: {
      id: 'c1',
      kind: 'wrong',
      comment: 'O número não bate com a Ficha.',
      status: 'received',
      editKey: 'k'.repeat(43),
    },
  },
} satisfies Meta<typeof CommentEdit>

export default meta

type Story = StoryObj<typeof meta>

/** Recebido, with its edit key: the button. */
export const Recebido: Story = {}

/** The form, filled with the current type and text. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(screen.getByRole('button', { name: EDIT_COMMENT }))
    await expect(screen.getByLabelText(COMMENT.text)).toHaveValue(
      'O número não bate com a Ficha.',
    )
  },
}

/** Corrigido: no button. */
export const Corrigido: Story = {
  args: {
    comment: { ...meta.args.comment, status: 'corrected' },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button', { name: EDIT_COMMENT }),
    ).toBeNull()
  },
}
