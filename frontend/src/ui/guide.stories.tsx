import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnswerConfidence } from './guide'

const meta = {
  component: AnswerConfidence,
  parameters: { layout: 'padded' },
  args: { confidence: 'moderada' },
} satisfies Meta<typeof AnswerConfidence>

export default meta

type Story = StoryObj<typeof meta>

/** The 72px steps next to the label, as at the top of the short answer. */
export const Moderate: Story = {}

export const Strong: Story = { args: { confidence: 'forte' } }

export const Weak: Story = { args: { confidence: 'fraca' } }
