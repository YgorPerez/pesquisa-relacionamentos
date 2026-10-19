import type { Meta, StoryObj } from '@storybook/react-vite'
import { ForcaDaEvidencia, LegendaDasFichas, StatusDeVerificacao } from './selos'

const meta = {
  component: LegendaDasFichas,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LegendaDasFichas>

export default meta

type Story = StoryObj<typeof meta>

/** Os três Status e as três Forças, cada um desenhado e escrito. */
export const Legenda: Story = {}

/** Como os selos aparecem lado a lado na lista de Fichas. */
export const NaLinhaDaFicha: Story = {
  render: () => (
    <div className="ficha-meta">
      <StatusDeVerificacao status="parcial" />
      <ForcaDaEvidencia forca="moderada" />
      <span>EUA · 2017 · n = 5.421</span>
    </div>
  ),
}
