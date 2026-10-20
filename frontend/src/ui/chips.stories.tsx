import type { Meta, StoryObj } from '@storybook/react-vite'
import { toggleInTop3 } from '@tem-estudo/rules/priorities'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Top3Picker } from './priorities'
import { TRAITS } from './priorities.example'

/** The top 3 chips with real state: a tap gives the next number. */
function Chips({ initial }: { initial: ReadonlyArray<string> }) {
  const [top3, setTop3] = useState(initial)
  return (
    <Top3Picker
      traits={TRAITS}
      top3={top3}
      onToggle={(id) => setTop3(toggleInTop3(top3, id))}
    />
  )
}

const meta = {
  component: Chips,
  parameters: { layout: 'padded' },
  args: { initial: [] },
} satisfies Meta<typeof Chips>

export default meta

type Story = StoryObj<typeof meta>

/** Nothing chosen yet. */
export const Empty: Story = {}

/** Two chosen, numbered in tap order; one is missing. */
export const Two: Story = { args: { initial: ['renda', 'sexo'] } }

/** Three chosen: the others become unavailable, with the swap hint. */
export const Full: Story = { args: { initial: ['renda', 'sexo', 'parecido'] } }

/** A tap gives the next number, and tapping again removes and renumbers. */
export const TapAndNumber: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    const chip = (name: string) =>
      screen.getByRole('button', { name: new RegExp(`${name}$`) })
    await userEvent.click(chip('Renda'))
    await userEvent.click(chip('Aparência'))
    await expect(chip('Aparência')).toHaveAccessibleName('sua 2ª: Aparência')
    await userEvent.click(chip('Renda'))
    await expect(chip('Aparência')).toHaveAccessibleName('sua 1ª: Aparência')
    await expect(chip('Renda')).toHaveAttribute('aria-pressed', 'false')
  },
}
