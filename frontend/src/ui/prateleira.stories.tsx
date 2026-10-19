import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Estante } from './prioridades'
import { CARACTERISTICAS } from './prioridades.exemplo'

type Props = Omit<
  ComponentProps<typeof Estante>,
  'aberta' | 'aoAbrir' | 'caracteristicas'
> & { abertaNoInicio?: string }

/** As prateleiras com estado de verdade: tocar num livro abre o detalhe. */
function Prateleiras({ abertaNoInicio, ...props }: Props) {
  const [aberta, setAberta] = useState<string | null>(abertaNoInicio ?? null)
  return (
    <Estante
      {...props}
      caracteristicas={CARACTERISTICAS}
      aberta={aberta}
      aoAbrir={setAberta}
    />
  )
}

const meta = {
  component: Prateleiras,
  parameters: { layout: 'padded' },
  args: {
    desfecho: 'satisfacao',
    topo3: ['renda', 'sexo', 'parecido'],
    genero: undefined,
  },
} satisfies Meta<typeof Prateleiras>

export default meta

type Story = StoryObj<typeof meta>

/** Satisfação: as escolhidas numeradas e em amarelo, as outras apagadas. */
export const Satisfacao: Story = {}

/** Duração: tudo em "não sabemos", e as outras prateleiras dizem "nenhuma". */
export const Duracao: Story = { args: { desfecho: 'duracao' } }

/** Sem topo 3: nenhum livro em amarelo. */
export const SemTopo3: Story = { args: { topo3: [] } }

/** Com o detalhe de uma característica aberto embaixo da prateleira. */
export const ComDetalhe: Story = { args: { abertaNoInicio: 'aparencia' } }

/** Tocar no livro abre o detalhe, e tocar de novo fecha. */
export const AbrirEFechar: Story = {
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    const livro = tela.getByRole('button', { name: 'sua 2ª: Química sexual' })
    await userEvent.click(livro)
    await expect(livro).toHaveAttribute('aria-expanded', 'true')
    await expect(
      tela.getByRole('region', { name: 'Química sexual, satisfação' }),
    ).toBeVisible()
    await userEvent.click(livro)
    await expect(
      tela.queryByRole('region', { name: 'Química sexual, satisfação' }),
    ).toBeNull()
  },
}
