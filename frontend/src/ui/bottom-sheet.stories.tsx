// The sheet at the bottom of the screen (`bottom-sheet.tsx`, #345) alone,
// open over a page, with a field. How the Comentário uses it on touch is the
// screen test's (`selection-comment.test.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Textarea } from '@/ui/shadcn/textarea'
import { BottomSheet } from './bottom-sheet'
import { CLOSE } from './bottom-sheet.copy'

function OpenSheet() {
  const [open, setOpen] = useState(true)
  return (
    <BottomSheet open={open} onClose={() => setOpen(false)} title="Comentar">
      <Textarea aria-label="Seu comentário" />
    </BottomSheet>
  )
}

const meta = {
  component: OpenSheet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof OpenSheet>

export default meta

type Story = StoryObj<typeof meta>

/** Open, with its title and a field; "Fechar" closes it. */
export const Open: Story = {
  play: async () => {
    const page = within(document.body)
    const sheet = await page.findByRole('dialog', { name: 'Comentar' })
    await expect(within(sheet).getByLabelText('Seu comentário')).toBeVisible()
    await userEvent.click(within(sheet).getByRole('button', { name: CLOSE }))
    // The sheet leaves the page once its way out has run.
    await waitFor(() =>
      expect(page.queryByRole('dialog', { name: 'Comentar' })).toBeNull(),
    )
  },
}
