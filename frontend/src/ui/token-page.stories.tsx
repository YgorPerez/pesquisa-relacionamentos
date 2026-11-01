import type { Meta, StoryObj } from '@storybook/react-vite'
import { TokenPage } from './token-page'

const meta = {
  component: TokenPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TokenPage>
export default meta
type Story = StoryObj<typeof meta>
export const WithAMessage: Story = {
  args: {
    title: 'Confirmar e-mail',
    message: 'Este link expirou ou já foi usado.',
    back: 'Voltar à conta',
  },
}
