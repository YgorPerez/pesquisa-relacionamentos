// A contagem (`contagem.tsx`): o "Ajudou?" do fim do Guia, a chave de contar
// as visitas e o rodapé que a leva. No Storybook, em localhost, nada sai para
// o GoatCounter (`analytics/contagem.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { Ajudou, Rodape } from './contagem'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const AjudouPergunta: Story = {
  render: () => <Ajudou guia="onde-os-casais-se-conhecem" />,
}

/** O "não" pede um dos quatro motivos, e a resposta agradece. */
export const AjudouNao: Story = {
  render: () => <Ajudou guia="onde-os-casais-se-conhecem" />,
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    await userEvent.click(tela.getByRole('button', { name: 'Não' }))
    await userEvent.click(
      tela.getByRole('button', { name: 'Difícil de entender' }),
    )
    await expect(tela.getByRole('status')).toHaveTextContent(/^Obrigado\./)
  },
}

/** O rodapé de toda página, com a chave "Contar minhas visitas". */
export const RodapeDaPagina: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Rodape />,
}
