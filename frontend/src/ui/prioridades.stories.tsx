import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { alternarNoTopo3 } from '@tem-estudo/regras/prioridades'
import type { CaracteristicaVista, FichaDaPrioridade } from '#/conteudo/vista-prioridades'
import { CartaoDePrioridades, EscolhaDoTopo3, Estante } from './prioridades'

const FICHA: FichaDaPrioridade = {
  slug: 'costa-2018-satisfacao',
  nome: 'Costa (2018)',
  status: 'parcial',
  forca: 'moderada',
  amostra: 'Casais casados recrutados online.',
}

const celula = (degrau: 0 | 1 | 2 | 3, texto = 'Nenhum estudo lido mede isso.') => ({
  degrau,
  medida: null,
  texto,
  ficha: degrau > 0 ? FICHA : null,
})

const CARS: ReadonlyArray<CaracteristicaVista> = [
  { id: 'aparencia', nome: 'Aparência', atracao: celula(3), satisfacao: celula(2, 'Só um pouco, e só no começo.'), duracao: celula(0) },
  { id: 'sexo', nome: 'Química sexual', atracao: celula(3), satisfacao: celula(3), duracao: celula(0) },
  { id: 'renda', nome: 'Renda', atracao: celula(2), satisfacao: celula(0), duracao: celula(0) },
  { id: 'parecido', nome: 'Ser parecido comigo', atracao: celula(1), satisfacao: celula(1), duracao: celula(0) },
  { id: 'idade', nome: 'Idade parecida', atracao: celula(0), satisfacao: celula(0), duracao: celula(0) },
]

const BARRA = { relacao: 45, parceiro: 5, semExplicacao: 50, ficha: { ...FICHA, nome: 'Joel et al. (2020)', status: 'ok' as const, forca: 'forte' as const } }

function Calculadora() {
  const [topo3, setTopo3] = useState<ReadonlyArray<string>>(['renda', 'sexo'])
  const [aberta, setAberta] = useState<string | null>(null)
  return (
    <>
      <EscolhaDoTopo3 caracteristicas={CARS} topo3={topo3} aoTocar={(id) => setTopo3(alternarNoTopo3(topo3, id))} />
      <Estante caracteristicas={CARS} desfecho="satisfacao" topo3={topo3} aberta={aberta} aoAbrir={setAberta} genero={undefined} />
    </>
  )
}

const meta = {
  component: Calculadora,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Calculadora>

export default meta

type Story = StoryObj<typeof meta>

/** Chips do topo 3 e as quatro prateleiras de satisfação. */
export const ChipsEPrateleiras: Story = {}

/** O cartão do Guia B1 com um topo 3 escolhido. */
export const CartaoDoB1: Story = {
  render: () => <CartaoDePrioridades barra={BARRA} caracteristicas={CARS} topo3={['sexo', 'parecido', 'renda']} />,
}
