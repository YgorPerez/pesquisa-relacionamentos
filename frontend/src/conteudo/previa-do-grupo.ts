// A conta da prévia do link do Grupo possível, sem o servidor: quem chama
// diz de onde vêm os pacotes. O site a chama no servidor
// (`buscarPreviaDoGrupo`, `previa.ts`), sobre os arquivos do build; o
// Storybook, no Node, sobre os pacotes que monta da fixture
// (`.storybook/previas-do-link.ts`).
import type {
  DadosDoLugar,
  LugarDoPacote,
} from '@tem-estudo/regras/grupo-possivel-dados'
import {
  estimarGrupo,
  type Estimativa,
} from '@tem-estudo/regras/grupo-possivel'
import { lerLink, previaDoGrupo, type Previa } from '@tem-estudo/regras/link'
import { REQUISITOS_PADRAO } from '@tem-estudo/regras/requisitos'

/** O que a conta lê do `virtual:grupo-possivel`. */
export interface DadosDaPrevia {
  readonly lugares: ReadonlyArray<LugarDoPacote>
  readonly exemplo: Estimativa
}

/** A prévia do link do Grupo possível; `null` se a query não é de link ou os
 * dados faltam. */
export async function montarPreviaDoGrupo(
  query: string,
  dados: DadosDaPrevia,
  pacote: (lugar: LugarDoPacote) => Promise<DadosDoLugar | null>,
): Promise<Previa | null> {
  const estado = lerLink('grupo-possivel', query)
  if (estado?.calculadora !== 'grupo-possivel') return null
  if (!estado.perfil && !estado.requisitos)
    return previaDoGrupo(estado, dados.exemplo)

  const requisitos = estado.requisitos ?? REQUISITOS_PADRAO
  const uf = requisitos.lugar?.uf
  const brasil = await pacote('BR')
  const daUf = uf && dados.lugares.includes(uf) ? await pacote(uf) : null
  if (!brasil || (uf && !daUf)) return null
  const conta = (r: typeof requisitos): Estimativa =>
    estimarGrupo(
      { perfil: estado.perfil, requisitos: r },
      { brasil, ...(daUf && { uf: daUf }) },
    )
  const codigo = requisitos.lugar?.municipio
  const municipio = codigo ? daUf?.municipios.get(codigo)?.nome : undefined
  if (codigo && !municipio) {
    // Um município que os dados de agora não têm: vale a UF inteira, como na página.
    const naUf = { ...requisitos, lugar: uf ? { uf } : null }
    return previaDoGrupo({ ...estado, requisitos: naUf }, conta(naUf))
  }
  return previaDoGrupo(estado, conta(requisitos), { municipio })
}
