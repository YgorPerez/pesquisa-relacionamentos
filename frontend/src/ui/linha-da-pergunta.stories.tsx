// A linha grande (`linha-da-pergunta.tsx`): uma Pergunta do Guia e uma
// calculadora do início.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LinhaDaCalculadora, LinhaDePergunta } from './linha-da-pergunta'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Pergunta: Story = {
  render: () => (
    <LinhaDePergunta
      guia={{
        tema: 'onde-conhecer-pessoas',
        slug: 'app-ou-presencial',
        pergunta: 'App ou presencial: onde é melhor conhecer alguém?',
        primeiraFrase: 'Os casais que se conheceram online não duram menos.',
      }}
    />
  ),
}

export const Calculadora: Story = {
  render: () => (
    <LinhaDaCalculadora
      href="/grupo-possivel"
      titulo="Grupo possível"
      resumo="Quantas pessoas no Brasil atendem ao que você procura."
    />
  ),
}
