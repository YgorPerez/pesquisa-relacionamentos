import type { Meta, StoryObj } from '@storybook/react-vite'
import { VisualChart } from './visual-chart'

const meta = {
  component: VisualChart,
  args: {
    visual: {
      kind: 'bars',
      id: 'chart-example',
      title: 'Fatia online por estudo',
      note: null,
      rows: [
        {
          id: 'one',
          label: 'Casais recentes',
          value: 39,
          number: { text: '39%', own: null, sources: [] },
        },
        {
          id: 'two',
          label: 'Todos os casais',
          value: 10.9,
          number: { text: '10,9%', own: null, sources: [] },
        },
      ],
    },
  },
} satisfies Meta<typeof VisualChart>
export default meta
type Story = StoryObj<typeof meta>
export const Bars: Story = {}
export const Dots: Story = {
  args: { visual: { ...meta.args.visual, kind: 'dots' } },
}
