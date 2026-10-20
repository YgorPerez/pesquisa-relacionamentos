// A navegação: a barra do topo, os voltares do DESIGN.md e o laço que
// circula a Ficha tocada (`navegacao.tsx`, `topo.tsx`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LacoDaFicha, LinkDeVoltar, VoltarParaGuia } from './navegacao'
import { Topo } from './topo'

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** O topo de qualquer página que não é de um Guia: só o nome do site. */
export const BarraDoTopo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <Topo />,
}

export const VoltarParaALista: Story = {
  render: () => <LinkDeVoltar to="/estudos">Todos os estudos</LinkDeVoltar>,
}

/** Quem chegou de outro Guia volta para ele. */
export const VoltarParaOGuia: Story = {
  parameters: {
    historico: { de: 'Onde os casais se conhecem hoje?' },
  },
  render: () => <VoltarParaGuia />,
}

/** A Ficha circulada depois do toque num número de referência. */
export const FichaCirculada: Story = {
  render: () => (
    <ul className="m-0 list-none p-0">
      <li className="relative p-3" tabIndex={-1}>
        Rosenfeld, Thomas e Hausen (2019). Disintermediating your friends.
        <LacoDaFicha />
      </li>
    </ul>
  ),
}
