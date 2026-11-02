import type { Meta, StoryObj } from '@storybook/react-vite'
import { FoldArrow } from './fold-arrow'

const meta = { component: FoldArrow } satisfies Meta<typeof FoldArrow>
export default meta
type Story = StoryObj<typeof meta>
export const Closed: Story = { args: { className: '' } }
export const Open: Story = { args: { className: 'rotate-90' } }
