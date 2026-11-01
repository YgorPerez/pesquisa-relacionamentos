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
export const JustDeleted: Story = { args: { account: null, deleted: true } }
export const SyncConsent: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'ask' },
}
// A signed-in story always passes `syncStatus`: without it the page calls
// `/api/sync`, which Storybook does not have.
export const SyncActive: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'active' },
}
export const SyncDeclined: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'declined' },
}
export const SyncFailed: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'failed' },
}
export const SyncDevice: Story = {
  args: { account: { nickname: 'Leitora' }, syncStatus: 'device' },
}
