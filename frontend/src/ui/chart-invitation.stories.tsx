// The label under a chart (#500), in the words of this browser's device. The
// pulse needs a chart and a screen to come into: see it on the Guide.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartHint } from './chart-invitation'

const meta = {
  component: ChartHint,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ChartHint>

export default meta
type Story = StoryObj<typeof meta>

export const Label: Story = {}
