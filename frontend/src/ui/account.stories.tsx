import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountPage } from './account'

const meta = {
  component: AccountPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AccountPage>
export default meta
type Story = StoryObj<typeof meta>
export const Anonymous: Story = { args: { account: null } }
export const FirstUse: Story = { args: { account: { nickname: null } } }
export const SignedIn: Story = { args: { account: { nickname: 'Leitora' } } }
export const SyncConsent: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'ask' },
}
export const SyncActive: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'active' },
}
export const SyncDeclined: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'declined' },
}
export const SyncDevice: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'device' },
}
