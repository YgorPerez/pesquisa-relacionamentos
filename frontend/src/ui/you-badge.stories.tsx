import type { Meta, StoryObj } from '@storybook/react-vite'
import { YouBadge } from './profile'

const meta = {
  component: YouBadge,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof YouBadge>

export default meta

type Story = StoryObj<typeof meta>

/** The yellow badge of a finding that covers the Profile. */
export const AppliesToYou: Story = {}

/** Someone seeking men and women, and only one side has data. */
export const OnlyWomen: Story = { args: { only: 'mulheres' } }

export const OnlyMen: Story = { args: { only: 'homens' } }
