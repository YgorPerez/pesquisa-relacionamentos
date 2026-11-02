import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountDeletion } from './account-deletion'

const meta = {
  component: AccountDeletion,
} satisfies Meta<typeof AccountDeletion>
export default meta
type Story = StoryObj<typeof meta>
export const WithComments: Story = { args: { canPublish: true } }
export const WithoutNickname: Story = { args: { canPublish: false } }
