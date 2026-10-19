// Estado conjugal por município, sexo e grupo de idade (SIDRA 10185, a partir
// de 15 anos), para o Grupo possível num município (#31).
//
// O ajuste proporcional pela população (9514) aplica à cidade a proporção
// sem união do estado inteiro, e na capital de São Paulo isso fica 10% abaixo
// do que o IBGE publica: a capital tem mais gente sem união que o interior.
// A 10185 publica a união por município, então a calculadora escala cada
// célula da UF pela população do município na mesma combinação de sexo ×
// grupo × união.
import type { CelulaConjugal } from './conferencia.ts'

export const GRUPOS = [
  '15-19',
  '20-24',
  '25-29',
  '30-34',
  '35-39',
  '40-44',
  '45-49',
  '50-54',
  '55-59',
  '60-64',
  '65-69',
  '70-74',
  '75-79',
  '80+',
] as const
const COLUNAS = (['homem', 'mulher'] as const).flatMap((s) =>
  GRUPOS.flatMap((g) => [`${s}_${g}_sim`, `${s}_${g}_nao`]),
)

export interface ConjugalDoMunicipio {
  readonly codigo: string
  readonly nome: string
  readonly uf: string
  /** Pessoas por coluna `sexo_grupo_sim|nao`. */
  readonly pessoas: ReadonlyMap<string, number>
}

const rotuloUniao = {
  sim: 'vivia em união',
  nao: 'não vivia em união',
} as const

/** A 10185 vem da amostra e cada número publicado é arredondado à pessoa:
 * somados, os municípios se afastam da UF em algumas pessoas. */
export const TOLERANCIA_MUNICIPIOS = { pessoas: 30, relativa: 0.001 }

/** Cada UF × sexo × grupo × união publicada tem de ser a soma dos municípios dela. */
export function conferirMunicipios(
  municipios: ReadonlyArray<ConjugalDoMunicipio>,
  daUf: ReadonlyArray<CelulaConjugal>,
): string[] {
  const somas = new Map<string, number>()
  for (const m of municipios)
    for (const [coluna, pessoas] of m.pessoas)
      somas.set(
        `${m.uf}_${coluna}`,
        (somas.get(`${m.uf}_${coluna}`) ?? 0) + pessoas,
      )
  return daUf
    .filter((c) => c.local !== 'BR')
    .flatMap((c) => {
      const soma = somas.get(`${c.local}_${c.sexo}_${c.idade}_${c.uniao}`) ?? 0
      const tolerancia = Math.max(
        TOLERANCIA_MUNICIPIOS.pessoas,
        c.pessoas * TOLERANCIA_MUNICIPIOS.relativa,
      )
      return Math.abs(soma - c.pessoas) <= tolerancia
        ? []
        : [
            `${c.local} ${c.sexo} ${c.idade} ${rotuloUniao[c.uniao]}: municípios somam ${soma}, a UF publica ${c.pessoas}`,
          ]
    })
}

export function municipiosEmCsv(
  municipios: ReadonlyArray<ConjugalDoMunicipio>,
): string {
  const linhas = [...municipios]
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .map((m) => {
      if (m.nome.includes(','))
        throw new Error(`nome de município com vírgula: ${m.nome}`)
      return [
        m.codigo,
        m.nome,
        m.uf,
        ...COLUNAS.map((c) => m.pessoas.get(c) ?? 0),
      ].join(',')
    })
  return (
    [['municipio', 'nome', 'uf', ...COLUNAS].join(','), ...linhas].join('\n') +
    '\n'
  )
}
