import type { Meta, StoryObj } from '@storybook/react-vite'
import type { AccountMethods } from '#/content/method-notice'
import { LoginMethods, MethodMessage } from './login-methods'

const emailOnly: AccountMethods = {
  google: false,
  email: 'leitora@example.org',
  pendingEmail: null,
  canLinkGoogle: true,
  canChangePassword: true,
  canAddEmail: false,
  curator: false,
}
const googleOnly: AccountMethods = {
  ...emailOnly,
  google: true,
  email: null,
  canLinkGoogle: false,
  canChangePassword: false,
  canAddEmail: true,
}
const both: AccountMethods = {
  ...emailOnly,
  google: true,
  canLinkGoogle: false,
}

const meta = {
  component: LoginMethods,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LoginMethods>
export default meta
type Story = StoryObj<typeof meta>
export const EmailOnly: Story = { args: { methods: emailOnly } }
export const GoogleOnly: Story = { args: { methods: googleOnly } }
export const WaitingForTheLink: Story = {
  args: {
    methods: { ...googleOnly, pendingEmail: 'nova@example.org' },
  },
}
export const Both: Story = { args: { methods: both } }
export const Curator: Story = {
  args: { methods: { ...both, curator: true } },
}
export const Refused: Story = {
  args: { methods: both },
  render: (args) => (
    <>
      <MethodMessage notice="email-em-uso" />
      <LoginMethods {...args} />
    </>
  ),
}
export const Done: Story = {
  args: { methods: both },
  render: (args) => (
    <>
      <MethodMessage notice="senha-trocada" />
      <LoginMethods {...args} />
    </>
  ),
}
