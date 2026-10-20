// "Copiar link" (`compartilhar.tsx`): o botão, a frase do que o link revela e
// o aviso da contagem. O copiar de verdade, com a área de transferência, é
// do e2e (`e2e/link.e2e.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Compartilhar } from './compartilhar'
import { AVISO_DA_CONTAGEM } from './compartilhar.textos'

const meta = {
  component: Compartilhar,
  parameters: { layout: 'padded' },
  args: {
    query: 'v=1&genero=homem&procura=mulheres&idade=30',
    frase: 'O link leva o seu Perfil: homem, procura mulheres, 30 anos.',
    aviso: AVISO_DA_CONTAGEM,
  },
} satisfies Meta<typeof Compartilhar>

export default meta

type Story = StoryObj<typeof meta>

/** Numa calculadora: o link leva o estado, e o aviso vai junto. */
export const DaCalculadora: Story = {}

/** No Guia, sem título nem estado: o link é só o endereço. */
export const DoGuia: Story = {
  args: {
    semTitulo: true,
    query: undefined,
    aviso: undefined,
    frase: 'O link abre este Guia.',
  },
}
