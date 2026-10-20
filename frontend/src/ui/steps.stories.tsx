import type { Meta, StoryObj } from '@storybook/react-vite'
import { WeightLabel, EvidenceWeight } from './priorities'
import { Steps, StrengthBadge, FactSheetMeta } from './badges'

const meta = {
  component: Steps,
  parameters: { layout: 'padded' },
  args: { level: 'moderate' },
} satisfies Meta<typeof Steps>

export default meta

type Story = StoryObj<typeof meta>

/** Two of three steps filled: moderate evidence. */
export const Moderate: Story = {}

export const Strong: Story = { args: { level: 'strong' } }

export const Weak: Story = { args: { level: 'weak' } }

/** The 72px ones at the top of the short answer. */
export const Large: Story = { args: { level: 'strong', width: 72 } }

/** On the Fact sheet line, always with the word beside it. */
export const WithTheWord: Story = {
  render: () => (
    <FactSheetMeta>
      <StrengthBadge strength="strong" />
      <StrengthBadge strength="moderate" />
      <StrengthBadge strength="weak" withLabel />
    </FactSheetMeta>
  ),
}

/** The Priorities weight: three, two, one step, and the empty ring of "não
 * sabemos". */
export const WeightInPriorities: Story = {
  render: () => (
    <FactSheetMeta>
      {([3, 2, 1, 0] as const).map((n) => (
        <WeightLabel key={n} level={n} />
      ))}
      <EvidenceWeight level={0} width={42} />
    </FactSheetMeta>
  ),
}
