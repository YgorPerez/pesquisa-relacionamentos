import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordRecovery } from './password-recovery'
import { RECOVERY } from './password-recovery.copy'
const meta = {
  component: PasswordRecovery,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PasswordRecovery>
export default meta
type Story = StoryObj<typeof meta>
export const Request: Story = { args: {} }
export const Reset: Story = { args: { token: 'example-token' } }
export const Sent: Story = { args: { disabled: true, message: RECOVERY.sent } }
export const Unavailable: Story = {
  args: { disabled: true, message: RECOVERY.unavailable },
}
export const Expired: Story = { args: { message: RECOVERY.invalid } }
