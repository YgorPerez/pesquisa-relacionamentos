import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmailConfirmation } from './email-confirmation'
import { EMAIL_CONFIRMATION } from './email-confirmation.copy'

const meta = {
  component: EmailConfirmation,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EmailConfirmation>
export default meta
type Story = StoryObj<typeof meta>
export const Live: Story = {
  args: { token: 'example-token', email: 'leitora@example.org' },
}
export const OtherAccount: Story = {
  args: { message: EMAIL_CONFIRMATION.otherAccount },
}
export const Expired: Story = { args: { message: EMAIL_CONFIRMATION.invalid } }
