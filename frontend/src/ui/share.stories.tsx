// "Copiar link" (`share.tsx`): the button, the sentence of what the link
// reveals and the count notice. The real copy, with the clipboard, belongs to
// the e2e (`e2e/link.e2e.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Share } from './share'
import { COUNTING_NOTICE } from './share.copy'

const meta = {
  component: Share,
  parameters: { layout: 'padded' },
  args: {
    query: 'v=1&genero=homem&procura=mulheres&idade=30',
    sentence: 'O link leva o seu Perfil: homem, procura mulheres, 30 anos.',
    notice: COUNTING_NOTICE,
  },
} satisfies Meta<typeof Share>

export default meta

type Story = StoryObj<typeof meta>

/** In a calculator: the link carries the state, and the notice goes along. */
export const FromCalculator: Story = {}

/** In the Guide, without title or state: the link is just the address. */
export const FromGuide: Story = {
  args: {
    untitled: true,
    query: undefined,
    notice: undefined,
    sentence: 'O link abre este Guia.',
  },
}
