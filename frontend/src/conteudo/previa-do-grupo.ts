// A conta da prévia do link do Grupo possível, sem o servidor: quem chama
// diz de onde vêm os pacotes. O site a chama no servidor
// (`buscarPreviaDoGrupo`, `previa.ts`), sobre os arquivos do build; o
// Storybook, no Node, sobre os pacotes que monta da fixture
// (`.storybook/previas-do-link.ts`).
import type {
  PlaceData,
  PackPlace,
} from '@tem-estudo/rules/possible-group-data'
import { estimateGroup, type Estimate } from '@tem-estudo/rules/possible-group'
import { readLink, groupPreview, type Preview } from '@tem-estudo/rules/link'
import { DEFAULT_REQUIREMENTS } from '@tem-estudo/rules/requirements'

/** O que a conta lê do `virtual:grupo-possivel`. */
export interface DadosDaPrevia {
  readonly lugares: ReadonlyArray<PackPlace>
  readonly exemplo: Estimate
}

/** A prévia do link do Grupo possível; `null` se a query não é de link ou os
 * dados faltam. */
export async function montarPreviaDoGrupo(
  query: string,
  dados: DadosDaPrevia,
  pacote: (lugar: PackPlace) => Promise<PlaceData | null>,
): Promise<Preview | null> {
  const estado = readLink('grupo-possivel', query)
  if (estado?.calculator !== 'grupo-possivel') return null
  if (!estado.profile && !estado.requirements)
    return groupPreview(estado, dados.exemplo)

  const requisitos = estado.requirements ?? DEFAULT_REQUIREMENTS
  const uf = requisitos.lugar?.uf
  const brasil = await pacote('BR')
  const daUf = uf && dados.lugares.includes(uf) ? await pacote(uf) : null
  if (!brasil || (uf && !daUf)) return null
  const conta = (r: typeof requisitos): Estimate =>
    estimateGroup(
      { profile: estado.profile, requirements: r },
      { brazil: brasil, ...(daUf && { uf: daUf }) },
    )
  const codigo = requisitos.lugar?.municipio
  const municipio = codigo ? daUf?.municipalities.get(codigo)?.name : undefined
  if (codigo && !municipio) {
    // Um município que os dados de agora não têm: vale a UF inteira, como na página.
    const naUf = { ...requisitos, lugar: uf ? { uf } : null }
    return groupPreview({ ...estado, requirements: naUf }, conta(naUf))
  }
  return groupPreview(estado, conta(requisitos), { municipality: municipio })
}
