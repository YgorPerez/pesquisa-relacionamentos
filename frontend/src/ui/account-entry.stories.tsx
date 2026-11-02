import type { Meta, StoryObj } from '@storybook/react-vite'
import { EMAIL_TAKEN, WRONG_LOGIN } from '#/content/email-refusal'
import { AccountEntry } from './account-entry'

const meta = { component: AccountEntry } satisfies Meta<typeof AccountEntry>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: {} }
export const LoginRefused: Story = { args: { loginRefusal: WRONG_LOGIN } }
export const SignUpRefused: Story = { args: { signUpRefusal: EMAIL_TAKEN } }
