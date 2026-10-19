// O agregador dos microdados da amostra do Censo 2022 (acesso público): lê
// as linhas de `Pessoas_<UF>_publico.csv` e devolve o CSV longo e esparso do
// Grupo possível (#10, #8), uma linha por combinação não vazia com a soma dos
// pesos e o número de registros. Os códigos vêm do "Dicionário de Variáveis -
// Microdados CD2022"; o vazio quer dizer que o IBGE não tem o dado.

/** Salário mínimo de julho de 2022, a data de referência do Censo. */
export const SALARIO_MINIMO_2022 = 1212

export const UFS: Readonly<Record<string, string>> = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
  '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
  '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
  '41': 'PR', '42': 'SC', '43': 'RS',
  '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
}

/** P0180 (grupos de 5 anos, versão pública), a partir de 15 anos. */
export const GRUPOS_DE_IDADE: Readonly<Record<string, string>> = {
  '04': '15-19', '05': '20-24', '06': '25-29', '07': '30-34', '08': '35-39', '09': '40-44',
  '10': '45-49', '11': '50-54', '12': '55-59', '13': '60-64', '14': '65-69', '15': '70-74',
  '16': '75-79', '17': '80+',
}
const MENOS_DE_15 = new Set(['01', '02', '03'])

const SEXO: Readonly<Record<string, string>> = { '1': 'homem', '2': 'mulher' }
/** P0280: 1 mora com cônjuge; 2 já viveu; 3 nunca viveu. */
const UNIAO: Readonly<Record<string, string>> = { '1': 'sim', '2': 'nao', '3': 'nao' }
/** P0760 agrupado nos degraus do Requisito "escolaridade mínima". */
const ESCOLARIDADE: Readonly<Record<string, string>> = {
  '1': 'sem-fundamental', '2': 'sem-fundamental',
  '3': 'fundamental', '4': 'fundamental',
  '5': 'medio', '6': 'medio',
  '7': 'superior',
}
const COR: Readonly<Record<string, string>> = {
  '1': 'branca', '2': 'preta', '3': 'amarela', '4': 'parda', '5': 'indigena',
}
/** P0410 (9 grupos). 8 e 9 (não sabe, sem declaração) ficam sem dado. */
const RELIGIAO: Readonly<Record<string, string>> = {
  '1': 'catolica', '2': 'evangelica', '3': 'espirita', '4': 'umbanda-candomble',
  '5': 'outra', '6': 'outra', '7': 'sem-religiao',
}

export const COLUNAS = ['sexo', 'idade', 'uf', 'uniao', 'escolaridade', 'renda', 'cor', 'religiao', 'filhos'] as const
export type Coluna = (typeof COLUNAS)[number]

export type Celula = { readonly [K in Coluna]: string } & {
  readonly peso: number
  readonly n_registros: number
}

export interface Descarte {
  readonly registros: number
  readonly peso: number
}

export interface Agregado {
  /** Em ordem das colunas, para o CSV sair sempre igual. */
  readonly celulas: ReadonlyArray<Celula>
  /** A soma de todos os pesos por UF, inclusive os descartados. */
  readonly pesoTotal: Readonly<Record<string, number>>
  readonly descartados: { readonly menosDe15: Descarte; readonly sexoOuIdadeIgnorados: Descarte }
}

const LIDAS = ['P0020', 'P0110', 'P0150', 'P0180', 'P0210', 'P0280', 'P0340', 'P0410', 'P0760', 'P1110'] as const

/** P1110, rendimento de todas as fontes, em faixas de salário mínimo. */
function faixaDeRenda(valor: string): string {
  const reais = valor === '' ? 0 : Number(valor)
  if (!(reais > 0)) return 'sem-renda'
  const sm = reais / SALARIO_MINIMO_2022
  if (sm <= 1) return 'ate-1'
  if (sm <= 2) return '1-2'
  if (sm <= 5) return '2-5'
  return '5+'
}

/** P0340 só existe para mulheres de 12 anos ou mais. */
function filhos(sexo: string, valor: string): string {
  if (sexo !== 'mulher' || valor === '') return ''
  return Number(valor) > 0 ? 'sim' : 'nao'
}

/**
 * Agrega as linhas de um ou mais arquivos de pessoas. Cada arquivo começa
 * pelo seu cabeçalho; as linhas podem vir de um stream (`readline`).
 */
export async function agregarPessoas(linhas: Iterable<string> | AsyncIterable<string>): Promise<Agregado> {
  const porChave = new Map<string, { valores: string[]; peso: number; n: number }>()
  const pesoTotal: Record<string, number> = {}
  const menosDe15 = { registros: 0, peso: 0 }
  const ignorados = { registros: 0, peso: 0 }
  let indice: Record<(typeof LIDAS)[number], number> | null = null

  for await (const linha of linhas) {
    if (linha === '') continue
    const campos = linha.split(';')
    if (/^[A-Z]/.test(linha)) {
      const posicao = new Map(campos.map((nome, i) => [nome.trim(), i]))
      const novo = {} as Record<(typeof LIDAS)[number], number>
      for (const nome of LIDAS) {
        const i = posicao.get(nome)
        if (i === undefined) throw new Error(`falta a coluna ${nome} no cabeçalho do arquivo de pessoas`)
        novo[nome] = i
      }
      indice = novo
      continue
    }
    if (!indice) throw new Error('o arquivo de pessoas precisa começar pelo cabeçalho')
    const campo = (nome: (typeof LIDAS)[number]) => campos[indice![nome]] ?? ''

    const uf = UFS[campo('P0020')]
    if (!uf) throw new Error(`UF desconhecida: ${campo('P0020')}`)
    const peso = Number(campo('P0110'))
    if (!Number.isFinite(peso)) throw new Error(`peso inválido: ${campo('P0110')}`)
    pesoTotal[uf] = (pesoTotal[uf] ?? 0) + peso

    const grupo = campo('P0180')
    if (MENOS_DE_15.has(grupo)) {
      menosDe15.registros++
      menosDe15.peso += peso
      continue
    }
    const sexo = SEXO[campo('P0150')]
    const idade = GRUPOS_DE_IDADE[grupo]
    if (!sexo || !idade) {
      ignorados.registros++
      ignorados.peso += peso
      continue
    }

    const valores = [
      sexo,
      idade,
      uf,
      UNIAO[campo('P0280')] ?? '',
      ESCOLARIDADE[campo('P0760')] ?? '',
      faixaDeRenda(campo('P1110')),
      COR[campo('P0210')] ?? '',
      RELIGIAO[campo('P0410')] ?? '',
      filhos(sexo, campo('P0340')),
    ]
    const chave = valores.join('|')
    const celula = porChave.get(chave)
    if (celula) {
      celula.peso += peso
      celula.n++
    } else porChave.set(chave, { valores, peso, n: 1 })
  }

  const celulas = [...porChave.values()]
    .sort((a, b) => comparar(a.valores, b.valores))
    .map(({ valores, peso, n }) => {
      const celula: Record<string, string | number> = {}
      COLUNAS.forEach((coluna, i) => (celula[coluna] = valores[i] ?? ''))
      celula.peso = peso
      celula.n_registros = n
      return celula as Celula
    })

  return { celulas, pesoTotal, descartados: { menosDe15, sexoOuIdadeIgnorados: ignorados } }
}

function comparar(a: ReadonlyArray<string>, b: ReadonlyArray<string>): number {
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? ''
    const y = b[i] ?? ''
    if (x !== y) return x < y ? -1 : 1
  }
  return 0
}

/** O CSV do Grupo possível: vírgula, sem aspas (nenhum valor tem vírgula). */
export function celulasEmCsv(celulas: ReadonlyArray<Celula>): string {
  const linhas = [[...COLUNAS, 'peso', 'n_registros'].join(',')]
  for (const c of celulas) linhas.push([...COLUNAS.map((k) => c[k]), c.peso.toFixed(2), c.n_registros].join(','))
  return linhas.join('\n') + '\n'
}
