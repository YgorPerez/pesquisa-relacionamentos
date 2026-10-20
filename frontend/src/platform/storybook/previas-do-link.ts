// As prévias de link das calculadoras para a story
// (`previas-do-link.stories.tsx`), no papel do `cartoes-do-link.ts` do
// Festival dos Macacos (ADR 0037). O Storybook não tem servidor: a story faz,
// no navegador, a mesma conta que o servidor do site faz para o robô da rede
// social, sobre o conteúdo de fixture que o Storybook carrega
// (`.storybook/vite.config.ts`). O Grupo possível passa por
// `montarPreviaDoGrupo` (`conteudo/previa-do-grupo.ts`), a de
// `buscarPreviaDoGrupo`, com os pacotes que o plugin serve; Prioridades, por
// `previaDePrioridades` sobre a vista do acervo, como o loader da rota.
import { abrirPacote } from '@tem-estudo/rules/possible-group-data'
import {
  lerLink,
  previaDePrioridades,
  queryDoLink,
  type EstadoDoLink,
  type Previa,
} from '@tem-estudo/rules/link'
import { REQUISITOS_PADRAO } from '@tem-estudo/rules/requirements'
import acervo from 'virtual:acervo'
import grupoPossivel from 'virtual:grupo-possivel'
import { montarPreviaDoGrupo } from '#/conteudo/previa-do-grupo'
import { vistaDasPrioridades } from '#/conteudo/vista-prioridades'

/** Os links de exemplo, um por story. */
const EXEMPLOS = {
  grupoSemNada: {
    calculadora: 'grupo-possivel',
    perfil: null,
    requisitos: null,
  },
  grupoComPerfil: {
    calculadora: 'grupo-possivel',
    perfil: { genero: 'homem', procura: 'mulheres', idade: 30 },
    requisitos: null,
  },
  grupoEmRioBranco: {
    calculadora: 'grupo-possivel',
    perfil: { genero: 'mulher', procura: 'homens', idade: 28 },
    requisitos: {
      ...REQUISITOS_PADRAO,
      lugar: { uf: 'AC', municipio: '1200401' },
      naoFuma: true,
    },
  },
  prioridadesComTopo3: {
    calculadora: 'prioridades',
    genero: null,
    prioridades: {
      topo3: ['sexo', 'parecido', 'renda'],
      desfecho: 'satisfacao',
    },
  },
} satisfies Record<string, EstadoDoLink>

export type NomeDoExemplo = keyof typeof EXEMPLOS

/** O que o robô lê do link: o endereço e a prévia do Open Graph. */
export interface PreviaDoLink {
  /** O caminho com a query do link: `/grupo-possivel?v=1&…`. */
  readonly endereco: string
  readonly previa: Previa | null
}

const CAMINHO = {
  'grupo-possivel': '/grupo-possivel',
  prioridades: '/prioridades',
} as const

async function pacote(lugar: string) {
  const resposta = await fetch(`${grupoPossivel.base}/${lugar}.json`)
  return resposta.ok ? abrirPacote(await resposta.json()) : null
}

export async function previaDoLink(nome: NomeDoExemplo): Promise<PreviaDoLink> {
  const estado: EstadoDoLink = EXEMPLOS[nome]
  const query = queryDoLink(estado)
  const endereco = `${CAMINHO[estado.calculadora]}?${query}`
  if (estado.calculadora === 'grupo-possivel')
    return {
      endereco,
      previa: await montarPreviaDoGrupo(query, grupoPossivel, pacote),
    }
  const vista = vistaDasPrioridades(acervo)
  const lido =
    vista &&
    lerLink(
      'prioridades',
      query,
      vista.caracteristicas.map((c) => c.id),
    )
  return {
    endereco,
    previa:
      vista && lido?.calculadora === 'prioridades'
        ? previaDePrioridades(vista.caracteristicas, lido.prioridades)
        : null,
  }
}
