// O primeiro passo do pipeline (#8, #36): o microdado agregado tem de
// reproduzir números publicados no SIDRA, ou os pesos e os códigos estão
// errados e nada é gravado.
//
// Três conferências:
// - a soma dos pesos de cada UF dá a população da UF (tabela 9514). É a
//   única coisa que a calibração do arquivo público garante, então a
//   tolerância é de uma pessoa;
// - no Brasil, cada célula sexo × grupo de idade × estado conjugal da
//   tabela 10185 bate com o microdado a menos de 2,5%;
// - em cada UF, a proporção que não vivia em união, por sexo × grupo de
//   idade, bate a menos de 3 pontos percentuais. A contagem absoluta numa UF
//   pequena pode se afastar mais (o IBGE avisa que só o total da UF é
//   calibrado), mas um código trocado muda a proporção muito mais do que isso.
//
// Na PNS, a distribuição da orientação sexual por sexo tem de dar a Tabela
// 1.1.1 publicada pelo IBGE, o que confere o peso, o filtro dos adultos e os
// códigos de Y008.
import type { Agregado } from './censo.ts'
import { proporcao, type RegistroPns } from './pns.ts'

export interface CelulaConjugal {
  /** `BR` ou a sigla da UF. */
  readonly local: string
  readonly sexo: string
  readonly idade: string
  readonly uniao: 'sim' | 'nao'
  readonly pessoas: number
}

export interface Publicado {
  /** População residente por UF (SIDRA 9514, total). */
  readonly populacao: Readonly<Record<string, number>>
  /** SIDRA 10185, cor ou raça total, a partir de 15 anos. */
  readonly conjugal: ReadonlyArray<CelulaConjugal>
}

export interface Conferencia {
  readonly falhas: ReadonlyArray<string>
  readonly celulasConferidas: number
  /** A maior diferença relativa no Brasil, para o `.meta.yaml`. */
  readonly maiorDiferencaBrasil: number
  /** A maior diferença de proporção nas UFs, em pontos (0,01 = 1 ponto). */
  readonly maiorDiferencaUf: number
}

export const TOLERANCIA_BRASIL = 0.025
export const TOLERANCIA_UF = 0.03

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const umaCasa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const sinal = (x: number) => (x >= 0 ? '+' : '−') + umaCasa.format(Math.abs(x * 100))
const rotuloUniao = { sim: 'vivia em união', nao: 'não vivia em união' } as const

export function conferir(agregado: Agregado, publicado: Publicado): Conferencia {
  const falhas: string[] = []

  for (const [uf, pessoas] of Object.entries(publicado.populacao)) {
    const soma = agregado.pesoTotal[uf] ?? 0
    if (Math.abs(soma - pessoas) >= 1)
      falhas.push(`${uf}: a soma dos pesos dá ${inteiro.format(soma)} pessoas e o SIDRA publica ${inteiro.format(pessoas)}`)
  }

  const micro = new Map<string, number>()
  const somar = (chave: string, peso: number) => micro.set(chave, (micro.get(chave) ?? 0) + peso)
  for (const c of agregado.celulas) {
    somar([c.uf, c.sexo, c.idade, c.uniao].join('|'), c.peso)
    somar(['BR', c.sexo, c.idade, c.uniao].join('|'), c.peso)
  }
  const doMicro = (local: string, sexo: string, idade: string, uniao: string) =>
    micro.get([local, sexo, idade, uniao].join('|')) ?? 0

  let maiorDiferencaBrasil = 0
  let maiorDiferencaUf = 0
  const publicadoPor = new Map(publicado.conjugal.map((c) => [[c.local, c.sexo, c.idade, c.uniao].join('|'), c.pessoas]))

  for (const c of publicado.conjugal) {
    if (c.local === 'BR') {
      const m = doMicro(c.local, c.sexo, c.idade, c.uniao)
      const diferenca = (m - c.pessoas) / c.pessoas
      maiorDiferencaBrasil = Math.max(maiorDiferencaBrasil, Math.abs(diferenca))
      if (Math.abs(diferenca) > TOLERANCIA_BRASIL)
        falhas.push(
          `BR ${c.sexo} ${c.idade} ${rotuloUniao[c.uniao]}: o microdado dá ${inteiro.format(m)} e o SIDRA publica ${inteiro.format(c.pessoas)} (${sinal(diferenca)}%)`,
        )
    } else if (c.uniao === 'nao') {
      const sim = publicadoPor.get([c.local, c.sexo, c.idade, 'sim'].join('|')) ?? 0
      const pSidra = c.pessoas / (c.pessoas + sim)
      const mNao = doMicro(c.local, c.sexo, c.idade, 'nao')
      const mTotal = mNao + doMicro(c.local, c.sexo, c.idade, 'sim')
      const pMicro = mTotal > 0 ? mNao / mTotal : 0
      const diferenca = Math.abs(pMicro - pSidra)
      maiorDiferencaUf = Math.max(maiorDiferencaUf, diferenca)
      if (diferenca > TOLERANCIA_UF)
        falhas.push(
          `${c.local} ${c.sexo} ${c.idade}: não viviam em união ${umaCasa.format(pMicro * 100)}% no microdado e ${umaCasa.format(pSidra * 100)}% no SIDRA (${umaCasa.format(diferenca * 100)} pontos)`,
        )
    }
  }

  return { falhas, celulasConferidas: publicado.conjugal.length, maiorDiferencaBrasil, maiorDiferencaUf }
}

export interface PublicadoPns {
  readonly sexo: 'homem' | 'mulher'
  readonly categoria: string
  /** Em %, com uma casa, como na tabela. */
  readonly percentual: number
}

/**
 * PNS 2019, Tabela 1.1.1 ("Distribuição das pessoas de 18 anos ou mais de
 * idade, por sexo [...] segundo a orientação sexual - Brasil - 2019"), do
 * arquivo `PNS_2019_Orientacao_Sexual_Autoidentificada_xls.zip` do FTP do IBGE.
 */
export const TABELA_1_1_1: ReadonlyArray<PublicadoPns> = [
  { sexo: 'homem', categoria: 'heterossexual', percentual: 94.7 },
  { sexo: 'homem', categoria: 'bissexual', percentual: 0.5 },
  { sexo: 'homem', categoria: 'homossexual', percentual: 1.4 },
  { sexo: 'homem', categoria: 'outra', percentual: 0.0 },
  { sexo: 'homem', categoria: 'nao-sabe', percentual: 1.1 },
  { sexo: 'homem', categoria: 'recusou', percentual: 2.3 },
  { sexo: 'mulher', categoria: 'heterossexual', percentual: 94.8 },
  { sexo: 'mulher', categoria: 'bissexual', percentual: 0.8 },
  { sexo: 'mulher', categoria: 'homossexual', percentual: 0.9 },
  { sexo: 'mulher', categoria: 'outra', percentual: 0.1 },
  { sexo: 'mulher', categoria: 'nao-sabe', percentual: 1.1 },
  { sexo: 'mulher', categoria: 'recusou', percentual: 2.3 },
]

/** A orientação sexual dos adultos, por sexo, tem de dar a tabela publicada. */
export function conferirPns(
  registros: ReadonlyArray<RegistroPns>,
  tabela: ReadonlyArray<PublicadoPns> = TABELA_1_1_1,
): string[] {
  const falhas: string[] = []
  for (const linha of tabela) {
    const dominio = registros.filter((r) => r.sexo === linha.sexo && r.orientacao !== null)
    const { p } = proporcao(dominio, (r) => r.orientacao === linha.categoria)
    // A tabela arredonda a uma casa: o microdado tem de cair no mesmo meio décimo.
    if (Math.abs(p * 100 - linha.percentual) > 0.05 + 1e-9)
      falhas.push(
        `PNS ${linha.sexo} ${linha.categoria}: o microdado dá ${umaCasa.format(p * 100)}% e a Tabela 1.1.1 publica ${umaCasa.format(linha.percentual)}%`,
      )
  }
  return falhas
}
