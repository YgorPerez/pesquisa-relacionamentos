// The count (`counting.tsx`): the "Ajudou?" at the end of the Guide, the
// switch for counting visits and the footer that carries it. In Storybook,
// on localhost, nothing goes out to GoatCounter (`analytics/counting.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { WasItHelpful, Footer } from './counting'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const HelpedQuestion: Story = {
  render: () => <WasItHelpful guide="onde-os-casais-se-conhecem" />,
}

/** The "no" asks for one of the four reasons, and the answer thanks. */
export const HelpedNo: Story = {
  render: () => <WasItHelpful guide="onde-os-casais-se-conhecem" />,
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement)
    await userEvent.click(screen.getByRole('button', { name: 'Não' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Difícil de entender' }),
    )
    await expect(screen.getByRole('status')).toHaveTextContent(/^Obrigado\./)
  },
}

/** Every page's footer, with the "Contar minhas visitas" switch. */
export const PageFooter: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Footer />,
}
