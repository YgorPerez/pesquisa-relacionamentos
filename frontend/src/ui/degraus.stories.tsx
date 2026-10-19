import type { Meta, StoryObj } from '@storybook/react-vite'
import { EtiquetaDoPeso, PesoDaEvidencia } from './prioridades'
import { Degraus, ForcaDaEvidencia } from './selos'
import { MetaDaFicha } from './guia'

const meta = {
  component: Degraus,
  parameters: { layout: 'padded' },
  args: { nivel: 'moderada' },
} satisfies Meta<typeof Degraus>

export default meta

type Story = StoryObj<typeof meta>

/** Dois de três degraus cheios: evidência moderada. */
export const Moderada: Story = {}

export const Forte: Story = { args: { nivel: 'forte' } }

export const Fraca: Story = { args: { nivel: 'fraca' } }

/** Os de 72px do topo da resposta curta. */
export const Grandes: Story = { args: { nivel: 'forte', largura: 72 } }

/** Na linha da Ficha, sempre com a palavra ao lado. */
export const ComAPalavra: Story = {
  render: () => (
    <MetaDaFicha>
      <ForcaDaEvidencia forca="forte" />
      <ForcaDaEvidencia forca="moderada" />
      <ForcaDaEvidencia forca="fraca" rotulo />
    </MetaDaFicha>
  ),
}

/** O peso de Prioridades: três, dois, um degrau, e o anel vazio de "não sabemos". */
export const PesoEmPrioridades: Story = {
  render: () => (
    <MetaDaFicha>
      {([3, 2, 1, 0] as const).map((n) => (
        <EtiquetaDoPeso key={n} degrau={n} />
      ))}
      <PesoDaEvidencia degrau={0} largura={42} />
    </MetaDaFicha>
  ),
}
