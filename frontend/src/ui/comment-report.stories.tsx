// "Denunciar" (`comment-report.tsx`): the button and its confirmation. Sending,
// which reaches the server, is the jsdom test's.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CommentReport } from './comment-report'
import { COMMENT_REPORT as COPY } from './comment-report.copy'

const meta = {
  component: CommentReport,
  parameters: { layout: 'padded' },
  args: { id: 1, onProblem: () => {} },
} satisfies Meta<typeof CommentReport>
export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Asking: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: COPY.report }))
    await expect(canvas.getByText(COPY.question)).toBeVisible()
  },
}
