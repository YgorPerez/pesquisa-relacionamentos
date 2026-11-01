import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommentQuote } from './comment-quote'

const meta = {
  component: CommentQuote,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CommentQuote>
export default meta
type Story = StoryObj<typeof meta>
export const Passage: Story = {
  args: { children: 'O lugar quase não muda a relação.' },
}
