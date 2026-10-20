import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Outcome } from '@tem-estudo/rules/priorities'
import type { ProfileGender } from '@tem-estudo/rules/profile'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Bookcase } from './priorities'
import { TRAITS } from './priorities.example'

interface Props {
  readonly outcome: Outcome
  readonly top3: ReadonlyArray<string>
  readonly gender: ProfileGender | undefined
  readonly initiallyOpen?: string
}

/** The shelves with real state: tapping a book opens the detail. */
function Shelves({ outcome, top3, gender, initiallyOpen }: Props) {
  const [open, setOpen] = useState<string | null>(initiallyOpen ?? null)
  return (
    <Bookcase
      traits={TRAITS}
      outcome={outcome}
      top3={top3}
      open={open}
      onOpen={setOpen}
      gender={gender}
    />
  )
}

const meta = {
  component: Shelves,
  parameters: { layout: 'padded' },
  args: {
    outcome: 'satisfacao',
    top3: ['renda', 'sexo', 'parecido'],
    gender: undefined,
  },
} satisfies Meta<typeof Shelves>

export default meta

type Story = StoryObj<typeof meta>

/** Satisfaction: the chosen ones numbered and in yellow, the others faded. */
export const Satisfaction: Story = {}

/** Duration: everything in "não sabemos", and the other shelves say
 * "nenhuma". */
export const Duration: Story = { args: { outcome: 'duracao' } }

/** No top 3: no book in yellow. */
export const NoTop3: Story = { args: { top3: [] } }

/** With a trait's detail open below the shelf. */
export const WithDetail: Story = { args: { initiallyOpen: 'aparencia' } }

/** Tapping the book opens the detail, and tapping again closes it. */
export const OpenAndClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const book = canvas.getByRole('button', { name: 'sua 2ª: Química sexual' })
    await userEvent.click(book)
    await expect(book).toHaveAttribute('aria-expanded', 'true')
    await expect(
      canvas.getByRole('region', { name: 'Química sexual, satisfação' }),
    ).toBeVisible()
    await userEvent.click(book)
    await expect(
      canvas.queryByRole('region', { name: 'Química sexual, satisfação' }),
    ).toBeNull()
  },
}
