import type { Meta, StoryObj } from '@storybook/react-vite'
import { toggleInTop3 } from '@tem-estudo/rules/priorities'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { EscolhaDoTopo3 } from './prioridades'
import { CARACTERISTICAS } from './prioridades.exemplo'

/** Os chips do topo 3 com estado de verdade: tocar dá o próximo número. */
function Chips({ inicio }: { inicio: ReadonlyArray<string> }) {
  const [topo3, setTopo3] = useState(inicio)
  return (
    <EscolhaDoTopo3
      caracteristicas={CARACTERISTICAS}
      topo3={topo3}
      aoTocar={(id) => setTopo3(toggleInTop3(topo3, id))}
    />
  )
}

const meta = {
  component: Chips,
  parameters: { layout: 'padded' },
  args: { inicio: [] },
} satisfies Meta<typeof Chips>

export default meta

type Story = StoryObj<typeof meta>

/** Nada escolhido ainda. */
export const Vazio: Story = {}

/** Dois escolhidos, numerados na ordem do toque; falta um. */
export const Dois: Story = { args: { inicio: ['renda', 'sexo'] } }

/** Três escolhidos: os outros ficam indisponíveis, com a dica de troca. */
export const Cheio: Story = { args: { inicio: ['renda', 'sexo', 'parecido'] } }

/** Tocar dá o próximo número, e tocar de novo tira e renumera. */
export const TocarENumerar: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const chip = (nome: string) =>
      tela.getByRole('button', { name: new RegExp(`${nome}$`) })
    await userEvent.click(chip('Renda'))
    await userEvent.click(chip('Aparência'))
    await expect(chip('Aparência')).toHaveAccessibleName('sua 2ª: Aparência')
    await userEvent.click(chip('Renda'))
    await expect(chip('Aparência')).toHaveAccessibleName('sua 1ª: Aparência')
    await expect(chip('Renda')).toHaveAttribute('aria-pressed', 'false')
  },
}
