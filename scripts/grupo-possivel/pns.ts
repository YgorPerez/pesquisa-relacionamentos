// As probabilidades da PNS 2019 que o Grupo possível aplica sobre o Censo
// (#8): orientação sexual (Y008), altura (P00404) e cigarro (P050), por
// sexo × faixa de idade, com o intervalo de 95% do desenho amostral.
//
// O universo é o morador selecionado de 18 anos ou mais com entrevista
// realizada (M001 = 1), pesado por V00291. O intervalo vem da linearização da
// razão com estrato (V0024) e UPA (UPA_PNS), a aproximação de conglomerado
// último que o IBGE usa nas tabelas da PNS.

export type Sexo = 'homem' | 'mulher'

export interface RegistroPns {
  readonly estrato: string
  readonly upa: string
  readonly peso: number
  readonly sexo: Sexo
  readonly idade: number
  /** `null` quando a pergunta ficou sem resposta para essa pessoa. */
  readonly orientacao: string | null
  readonly altura: number | null
  readonly fumo: string | null
}

export interface LinhaPns {
  readonly medida: 'orientacao' | 'altura' | 'fumo'
  readonly sexo: Sexo
  readonly idade: string
  readonly categoria: string
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  /** Registros sem peso no denominador. */
  readonly n_registros: number
}

/** As faixas de idade da PNS. Cada grupo de 5 anos do Censo cai numa só. */
export const FAIXAS_PNS = [
  { faixa: '18-24', min: 18, max: 24 },
  { faixa: '25-29', min: 25, max: 29 },
  { faixa: '30-34', min: 30, max: 34 },
  { faixa: '35-39', min: 35, max: 39 },
  { faixa: '40-49', min: 40, max: 49 },
  { faixa: '50-59', min: 50, max: 59 },
  { faixa: '60-69', min: 60, max: 69 },
  { faixa: '70+', min: 70, max: Infinity },
] as const

/** Y008, na ordem do dicionário. */
export const ORIENTACOES = ['heterossexual', 'bissexual', 'homossexual', 'outra', 'nao-sabe', 'recusou'] as const
/** P050: diariamente, menos que diariamente, não fuma. */
export const FUMO = ['diario', 'ocasional', 'nao'] as const
export const ALTURA_MIN = 140
export const ALTURA_MAX = 200

const faixaDe = (idade: number) => FAIXAS_PNS.find((f) => idade >= f.min && idade <= f.max)?.faixa

interface Pergunta {
  readonly medida: LinhaPns['medida']
  readonly categorias: ReadonlyArray<string>
  readonly respondeu: (r: RegistroPns) => boolean
  readonly indicador: (r: RegistroPns, categoria: string) => boolean
}

const alturas = Array.from({ length: ALTURA_MAX - ALTURA_MIN + 1 }, (_, i) => `ate-${ALTURA_MIN + i}`)

const PERGUNTAS: ReadonlyArray<Pergunta> = [
  {
    medida: 'orientacao',
    categorias: ORIENTACOES,
    respondeu: (r) => r.orientacao !== null,
    indicador: (r, c) => r.orientacao === c,
  },
  {
    medida: 'altura',
    categorias: alturas,
    respondeu: (r) => r.altura !== null,
    indicador: (r, c) => (r.altura ?? Infinity) <= Number(c.slice(4)),
  },
  {
    medida: 'fumo',
    categorias: FUMO,
    respondeu: (r) => r.fumo !== null,
    indicador: (r, c) => r.fumo === c,
  },
]

const Z95 = 1.96

/** As linhas do arquivo da PNS, em ordem de medida, sexo, faixa e categoria. */
export function estimarPns(registros: ReadonlyArray<RegistroPns>): LinhaPns[] {
  const linhas: LinhaPns[] = []
  for (const pergunta of PERGUNTAS) {
    for (const sexo of ['homem', 'mulher'] as const) {
      for (const { faixa } of FAIXAS_PNS) {
        const dominio = registros.filter((r) => r.sexo === sexo && faixaDe(r.idade) === faixa && pergunta.respondeu(r))
        if (dominio.length === 0) continue
        for (const categoria of pergunta.categorias) {
          const estimativa = proporcao(dominio, (r) => pergunta.indicador(r, categoria))
          linhas.push({ medida: pergunta.medida, sexo, idade: faixa, categoria, ...estimativa })
        }
      }
    }
  }
  return linhas
}

export interface Proporcao {
  readonly p: number
  readonly p_min: number
  readonly p_max: number
  readonly n_registros: number
}

/** A proporção ponderada de `y` no domínio, com o intervalo de 95%. */
export function proporcao(dominio: ReadonlyArray<RegistroPns>, y: (r: RegistroPns) => boolean): Proporcao {
  const total = dominio.reduce((s, r) => s + r.peso, 0)
  const sim = dominio.reduce((s, r) => s + (y(r) ? r.peso : 0), 0)
  const p = sim / total
  const erro = Z95 * Math.sqrt(variancia(dominio, total, p, y))
  return { p, p_min: Math.max(0, p - erro), p_max: Math.min(1, p + erro), n_registros: dominio.length }
}

/**
 * Variância da razão p = Σwy / Σw por linearização: o resíduo
 * z = w(y − p)/Σw somado por UPA, e a variância entre UPAs dentro de cada
 * estrato. Estrato com uma UPA só no domínio não contribui.
 */
function variancia(
  dominio: ReadonlyArray<RegistroPns>,
  total: number,
  p: number,
  y: (r: RegistroPns) => boolean,
): number {
  const porEstrato = new Map<string, Map<string, number>>()
  for (const r of dominio) {
    const upas = porEstrato.get(r.estrato) ?? new Map<string, number>()
    porEstrato.set(r.estrato, upas)
    const z = (r.peso * ((y(r) ? 1 : 0) - p)) / total
    upas.set(r.upa, (upas.get(r.upa) ?? 0) + z)
  }
  let v = 0
  for (const upas of porEstrato.values()) {
    const n = upas.size
    if (n < 2) continue
    const zs = [...upas.values()]
    const media = zs.reduce((s, z) => s + z, 0) / n
    v += (n / (n - 1)) * zs.reduce((s, z) => s + (z - media) ** 2, 0)
  }
  return v
}

/** Posições do `input_PNS_2019.sas` (coluna inicial, tamanho), base 1. */
const POSICOES = {
  V0024: [3, 7],
  UPA_PNS: [10, 9],
  C006: [108, 1],
  C008: [117, 3],
  M001: [527, 1],
  P00404: [617, 3],
  P050: [711, 1],
  Y008: [1304, 1],
  V00291: [1426, 14],
} as const

const campo = (linha: string, nome: keyof typeof POSICOES) => {
  const [inicio, tamanho] = POSICOES[nome]
  return linha.slice(inicio - 1, inicio - 1 + tamanho).trim()
}

const CODIGOS_ORIENTACAO: Readonly<Record<string, string>> = Object.fromEntries(
  ORIENTACOES.map((o, i) => [String(i + 1), o]),
)
const CODIGOS_FUMO: Readonly<Record<string, string>> = { '1': 'diario', '2': 'ocasional', '3': 'nao' }

/**
 * Uma linha do `PNS_2019.txt` (texto posicional). Devolve `null` para quem
 * não é morador selecionado de 18 anos ou mais com entrevista realizada.
 */
export function lerRegistroPns(linha: string): RegistroPns | null {
  if (campo(linha, 'M001') !== '1') return null
  const idade = Number(campo(linha, 'C008'))
  if (!(idade >= 18)) return null
  const sexo = campo(linha, 'C006') === '1' ? 'homem' : campo(linha, 'C006') === '2' ? 'mulher' : null
  const peso = Number(campo(linha, 'V00291'))
  if (!sexo || !(peso > 0)) return null
  const altura = Number(campo(linha, 'P00404'))
  return {
    estrato: campo(linha, 'V0024'),
    upa: campo(linha, 'UPA_PNS'),
    peso,
    sexo,
    idade,
    orientacao: CODIGOS_ORIENTACAO[campo(linha, 'Y008')] ?? null,
    altura: altura > 0 && altura < 999 ? altura : null,
    fumo: CODIGOS_FUMO[campo(linha, 'P050')] ?? null,
  }
}

const COLUNAS_PNS = ['medida', 'sexo', 'idade', 'categoria', 'p', 'p_min', 'p_max', 'n_registros'] as const

export function pnsEmCsv(linhas: ReadonlyArray<LinhaPns>): string {
  const saida = [COLUNAS_PNS.join(',')]
  for (const l of linhas)
    saida.push([l.medida, l.sexo, l.idade, l.categoria, l.p.toFixed(5), l.p_min.toFixed(5), l.p_max.toFixed(5), l.n_registros].join(','))
  return saida.join('\n') + '\n'
}
