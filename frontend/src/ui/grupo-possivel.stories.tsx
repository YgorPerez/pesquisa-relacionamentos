// As peças do Grupo possível (`grupo-possivel.tsx`) sobre uma conta de
// verdade: o `loader` baixa o pacote do Brasil que o plugin do Storybook
// serve (`.storybook/vite.config.ts`, dados de fixture, só o Acre) e faz a
// conta de uma mulher de 28 anos que procura homens, com superior completo e
// sem fumo.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { abrirPacote } from '@tem-estudo/regras/grupo-possivel-dados'
import {
  estimarGrupo,
  type Estimativa,
} from '@tem-estudo/regras/grupo-possivel'
import type { Perfil } from '@tem-estudo/regras/perfil'
import {
  REQUISITOS_PADRAO,
  ROTULO_DA_ESCOLARIDADE,
  type Requisitos,
} from '@tem-estudo/regras/requisitos'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import grupoPossivel from 'virtual:grupo-possivel'
import {
  CartaoDoGrupoPossivel,
  Dobras,
  Faixa,
  LinhaDoRequisito,
  Marcar,
  NumeroPreso,
  Opcoes,
  Passos,
} from './grupo-possivel'

const PERFIL: Perfil = { genero: 'mulher', procura: 'homens', idade: 28 }
const REQUISITOS: Requisitos = {
  ...REQUISITOS_PADRAO,
  escolaridade: 'superior',
  naoFuma: true,
}

async function conta(): Promise<{ estimativa: Estimativa }> {
  const resposta = await fetch(`${grupoPossivel.base}/BR.json`)
  const brasil = abrirPacote(await resposta.json())
  return {
    estimativa: estimarGrupo(
      { perfil: PERFIL, requisitos: REQUISITOS },
      { brasil },
    ),
  }
}

const meta = {
  parameters: { layout: 'padded' },
  loaders: [conta],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

type Carregado = Awaited<ReturnType<typeof conta>>

/** O número preso no topo da página, com a faixa. */
export const NumeroNoTopo: Story = {
  render: (_args, { loaded }) => (
    <NumeroPreso
      estimativa={(loaded as Carregado).estimativa}
      carregando={false}
    />
  ),
}

/** Enquanto os dados chegam, o número antigo fica, apagado. */
export const Carregando: Story = {
  render: (_args, { loaded }) => (
    <NumeroPreso estimativa={(loaded as Carregado).estimativa} carregando />
  ),
}

/** Quem nunca disse nada vê a conta de exemplo, feita no build. */
export const FaixaDeExemplo: Story = {
  render: () => <Faixa estimativa={grupoPossivel.exemplo} />,
}

/** Uma linha de Requisito de cada controle: passos, opções e caixa. */
export const LinhasDosRequisitos: Story = {
  render: function Linhas(_args, { loaded }) {
    const { estimativa } = loaded as Carregado
    const [idade, setIdade] = useState(28)
    const [escolaridade, setEscolaridade] = useState('superior')
    const [fuma, setFuma] = useState(true)
    const custo = (k: string) =>
      estimativa.custos.find((c) => c.requisito === k)
    return (
      <>
        <LinhaDoRequisito
          requisito="idade"
          valor={`${idade} anos`}
          custo={custo('idade')}
          ligado={false}
        >
          <Passos
            rotulo="Idade de"
            valor={idade}
            min={18}
            max={80}
            unidade={() => 'anos'}
            aoMudar={setIdade}
          />
        </LinhaDoRequisito>
        <LinhaDoRequisito
          requisito="escolaridade"
          valor={ROTULO_DA_ESCOLARIDADE.superior}
          custo={custo('escolaridade')}
          ligado
        >
          <Opcoes
            legenda="Escolaridade mínima"
            tipo="radio"
            valores={['qualquer', 'medio', 'superior']}
            rotulos={{
              qualquer: 'qualquer',
              medio: ROTULO_DA_ESCOLARIDADE.medio,
              superior: ROTULO_DA_ESCOLARIDADE.superior,
            }}
            marcados={[escolaridade]}
            aoMudar={setEscolaridade}
          />
        </LinhaDoRequisito>
        <LinhaDoRequisito
          requisito="fumo"
          valor="não fuma"
          custo={custo('fumo')}
          ligado
        >
          <Marcar rotulo="Só quem não fuma" marcado={fuma} aoMudar={setFuma} />
        </LinhaDoRequisito>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const tela = within(canvasElement)
    await userEvent.click(
      tela.getByRole('button', { name: 'Idade de: mais 1' }),
    )
    await expect(tela.getByLabelText('Idade de')).toHaveValue('29')
  },
}

/** As dobras recolhidas embaixo da conta: o funil e a conta ingênua. */
export const DobrasDaConta: Story = {
  render: (_args, { loaded }) => (
    <Dobras
      estimativa={(loaded as Carregado).estimativa}
      perfil={PERFIL}
      requisitos={REQUISITOS}
      municipio={undefined}
    />
  ),
}

/** O cartão no Guia que hospeda a calculadora, antes e depois do uso. */
export const CartaoSemUso: Story = {
  render: () => (
    <CartaoDoGrupoPossivel
      estimativa={grupoPossivel.exemplo}
      usado={false}
      ligados={[]}
      carregando={false}
    />
  ),
}

export const CartaoUsado: Story = {
  render: (_args, { loaded }) => (
    <CartaoDoGrupoPossivel
      estimativa={(loaded as Carregado).estimativa}
      usado
      ligados={['superior completo', 'não fuma']}
      carregando={false}
    />
  ),
}
