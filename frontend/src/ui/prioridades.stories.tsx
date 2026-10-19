import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { alternarNoTopo3 } from '@tem-estudo/regras/prioridades'
import { CartaoDePrioridades, EscolhaDoTopo3, Estante } from './prioridades'
import { BARRA, CARACTERISTICAS } from './prioridades.exemplo'

function Calculadora() {
  const [topo3, setTopo3] = useState<ReadonlyArray<string>>(['renda', 'sexo'])
  const [aberta, setAberta] = useState<string | null>(null)
  return (
    <>
      <EscolhaDoTopo3
        caracteristicas={CARACTERISTICAS}
        topo3={topo3}
        aoTocar={(id) => setTopo3(alternarNoTopo3(topo3, id))}
      />
      <Estante
        caracteristicas={CARACTERISTICAS}
        desfecho="satisfacao"
        topo3={topo3}
        aberta={aberta}
        aoAbrir={setAberta}
        genero={undefined}
      />
    </>
  )
}

const meta = {
  component: Calculadora,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Calculadora>

export default meta

type Story = StoryObj<typeof meta>

/** Chips do topo 3 e as quatro prateleiras de satisfação, juntos como na página. */
export const ChipsEPrateleiras: Story = {}

/** O cartão do Guia B1 com um topo 3 escolhido. */
export const CartaoDoB1: Story = {
  render: () => (
    <CartaoDePrioridades
      barra={BARRA}
      caracteristicas={CARACTERISTICAS}
      topo3={['sexo', 'parecido', 'renda']}
    />
  ),
}
