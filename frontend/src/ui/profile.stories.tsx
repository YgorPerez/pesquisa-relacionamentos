import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppliesToNote } from './profile'

const meta = {
  component: AppliesToNote,
  parameters: { layout: 'padded' },
  args: { text: 'homens e mulheres, de 18 a 35 anos.', verdict: null },
} satisfies Meta<typeof AppliesToNote>

export default meta

type Story = StoryObj<typeof meta>

/** No Profile: only the sample note. */
export const NoProfile: Story = {}

/** The finding covers the Profile: yellow badge, and the note stays. */
export const AppliesToYou: Story = { args: { verdict: { covered: true } } }

/** Someone seeking both, and only one side has data. */
export const OnlyOneSide: Story = {
  args: { verdict: { covered: true, only: 'mulheres' } },
}

/** The finding does not cover: empty ring and the sentence in bold, no
 * pink. */
export const NoData: Story = {
  args: { text: 'casais homem-mulher.', verdict: { covered: false } },
}
