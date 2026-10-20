// As prévias de link das calculadoras, como um app de mensagem as mostra: a
// imagem fixa do site (`public/og.png`), o título e a descrição do Open
// Graph e o endereço. Cada prévia sai da mesma conta do servidor do site
// (`previas-do-link.ts`).
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ORIGEM } from '@tem-estudo/conteudo/busca'
import { expect, within } from 'storybook/test'
import {
  previaDoLink,
  type NomeDoExemplo,
  type PreviaDoLink,
} from './previas-do-link'

function Cartao({ endereco, previa }: PreviaDoLink) {
  if (!previa) throw new Error(`sem prévia para ${endereco}`)
  return (
    <figure className="m-0 max-w-88 overflow-hidden rounded-mao-2 border-2 border-tinta bg-folha">
      <img
        src="/og.png"
        alt=""
        width={1200}
        height={630}
        className="block h-auto w-full"
      />
      <figcaption className="p-3">
        <b className="block font-title text-linha leading-tight">
          {previa.titulo}
        </b>
        <span className="mt-1 block text-nota leading-nota text-tinta-2">
          {previa.descricao}
        </span>
        <small className="mt-1.5 block text-label break-all text-tinta-2">
          {new URL(ORIGEM).host}
          {endereco}
        </small>
      </figcaption>
    </figure>
  )
}

const meta = {
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** A story de um exemplo: o `loader` faz a conta, e o cartão a mostra. */
const doExemplo = (nome: NomeDoExemplo, texto?: RegExp): Story => ({
  loaders: [() => previaDoLink(nome)],
  render: (_args, { loaded }) => <Cartao {...(loaded as PreviaDoLink)} />,
  ...(texto && {
    play: async ({ canvasElement }) => {
      await expect(within(canvasElement).getByText(texto)).toBeVisible()
    },
  }),
})

/** Sem Perfil nem Requisitos, a conta de exemplo do Brasil. */
export const GrupoPossivelSemNada = doExemplo('grupoSemNada', /^entre .+ e /i)

export const GrupoPossivelComPerfil = doExemplo('grupoComPerfil')

export const GrupoPossivelEmRioBranco = doExemplo(
  'grupoEmRioBranco',
  /Rio Branco/,
)

export const PrioridadesComOTopo3 = doExemplo(
  'prioridadesComTopo3',
  /^Topo 3: química sexual/,
)
