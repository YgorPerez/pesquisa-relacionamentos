import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  StrengthBadge,
  FactSheetLegend,
  VerificationStatusBadge,
  FactSheetMeta,
} from './badges'

const meta = {
  component: FactSheetLegend,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FactSheetLegend>

export default meta

type Story = StoryObj<typeof meta>

/** The three Statuses and the three Strengths, each drawn and written. */
export const Legend: Story = {}

/** How the badges appear side by side in the Fact sheet list. */
export const InTheFactSheetRow: Story = {
  render: () => (
    <FactSheetMeta>
      <VerificationStatusBadge status="partial" />
      <StrengthBadge strength="moderate" />
      <span className="text-tinta-2">EUA · 2017 · n = 5.421</span>
    </FactSheetMeta>
  ),
}
