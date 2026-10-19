// A estimativa do Grupo possível (#8, stories 39–52): quantas pessoas no
// Brasil atendem ao Perfil procurado e aos Requisitos.
//
// - Os Requisitos do Censo (idade, união, escolaridade, renda, cor, religião,
//   filhos) cruzam as células do microdado: só o peso das que atendem conta.
// - A idade exata sai do grupo de 5 anos pela fração das idades simples do
//   SIDRA 9514 no lugar.
// - Num município, cada célula da UF é escalada pela população do município
//   na mesma combinação de sexo × grupo × união (SIDRA 10185).
// - Os da PNS (orientação, altura, cigarro) multiplicam a célula pela
//   probabilidade no mesmo sexo e faixa de idade, com o intervalo dela.
// - A faixa junta esse intervalo com o erro de amostra do Censo, ±1,96/√n.
import {
  CELULAS_CONJUGAIS,
  GRUPOS_DE_IDADE,
  IDADES_SIMPLES,
  indiceConjugal,
  SEXOS,
  type DadosDoLugar,
  type Idades,
} from './grupo-possivel-dados.ts'
import type { Perfil } from './perfil.ts'
import {
  ALTURA_MAXIMA,
  ALTURA_MINIMA,
  CORES,
  ESCOLARIDADES,
  idadeProcurada,
  IDADE_PROCURADA_MAXIMA,
  IDADE_PROCURADA_MINIMA,
  quemSeProcura,
  RELIGIOES,
  RENDAS,
  type QuemSeProcura,
  type Requisitos,
} from './requisitos.ts'

/** Os Requisitos na ordem do funil. A orientação não tem controle: vem do Perfil. */
export const ORDEM_DOS_REQUISITOS = [
  'idade',
  'lugar',
  'companheiro',
  'orientacao',
  'escolaridade',
  'renda',
  'cor',
  'religiao',
  'filhos',
  'altura',
  'fumo',
] as const
export type RequisitoId = (typeof ORDEM_DOS_REQUISITOS)[number]

/** De onde vem cada Requisito. */
export const FONTE_DO_REQUISITO: Readonly<
  Record<RequisitoId, 'Censo' | 'PNS'>
> = {
  idade: 'Censo',
  lugar: 'Censo',
  companheiro: 'Censo',
  orientacao: 'PNS',
  escolaridade: 'Censo',
  renda: 'Censo',
  cor: 'Censo',
  religiao: 'Censo',
  filhos: 'Censo',
  altura: 'PNS',
  fumo: 'PNS',
}

/** Abaixo disso, o número leva "instável" (#8). */
export const REGISTROS_PARA_ESTAVEL = 50

export interface DadosDaConta {
  /** O pacote do Brasil, sempre: a base e o custo de soltar o lugar saem dele. */
  readonly brasil: DadosDoLugar
  /** O pacote da UF escolhida, quando há lugar. */
  readonly uf?: DadosDoLugar
}

export interface EntradaDaConta {
  readonly perfil: Perfil | null
  readonly requisitos: Requisitos
}

export interface Contagem {
  /** Pessoas, sem arredondar. */
  readonly min: number
  readonly central: number
  readonly max: number
  /** Registros da amostra por trás do número (fracionado pela idade e pelo município). */
  readonly registros: number
}

export interface Custo {
  readonly requisito: RequisitoId
  /** O grupo sem este Requisito, com os outros mantidos. */
  readonly sem: number
  readonly ganho: number
  /** `sem / atual`; `Infinity` quando o grupo atual é zero e soltar dá alguém. */
  readonly vezes: number
}

export interface Ressalva {
  readonly id: string
  readonly texto: string
  /** Aviso forte: aparece junto do número, não só em "De onde vem a incerteza". */
  readonly forte: boolean
}

export interface Estimativa {
  /** Quem se procura, para a frase: "mulheres", "homens" ou "pessoas". */
  readonly alvo: QuemSeProcura['alvo']
  /** Os Requisitos que entram na conta, na ordem do funil. */
  readonly ligados: ReadonlyArray<RequisitoId>
  readonly resultado: Contagem & { readonly instavel: boolean }
  /** Adultos (18+) do gênero procurado no Brasil, antes de qualquer Requisito. */
  readonly base: Contagem
  /** Do que mais pesa ao que menos. Sem a orientação, que não se solta. */
  readonly custos: ReadonlyArray<Custo>
  /** Corte a corte, na ordem de `ORDEM_DOS_REQUISITOS`. */
  readonly funil: ReadonlyArray<{
    readonly requisito: RequisitoId
    readonly central: number
  }>
  /** A conta por multiplicação: a base vezes a fração que cada Requisito deixa sozinho. */
  readonly ingenua: number
  readonly ressalvas: ReadonlyArray<Ressalva>
  /** "Sem filhos": vale, só para as mulheres (procura ambos) ou sem dado (procura homens). */
  readonly filhos: QuemSeProcura['filhos']
}

// --- partes da conta ---------------------------------------------------------

/** Os Requisitos que mudam a conta. */
export function requisitosLigados({
  perfil,
  requisitos: r,
}: EntradaDaConta): RequisitoId[] {
  const idade = idadeProcurada(perfil, r)
  const ligado: Record<RequisitoId, boolean> = {
    idade:
      idade.min > IDADE_PROCURADA_MINIMA || idade.max < IDADE_PROCURADA_MAXIMA,
    lugar: r.lugar !== null,
    companheiro: r.companheiro,
    orientacao: perfil?.genero === 'homem' || perfil?.genero === 'mulher',
    escolaridade: r.escolaridade !== null,
    renda: r.renda !== null,
    cor: r.cores.length > 0,
    religiao: r.religioes.length > 0,
    filhos: r.semFilhos && quemSeProcura(perfil).filhos !== 'sem-dado',
    altura: r.altura.min > ALTURA_MINIMA || r.altura.max < ALTURA_MAXIMA,
    fumo: r.naoFuma,
  }
  return ORDEM_DOS_REQUISITOS.filter((k) => ligado[k])
}

const primeiraIdade = (grupo: number) => 15 + 5 * grupo
const ultimaIdade = (grupo: number) =>
  grupo === GRUPOS_DE_IDADE.length - 1
    ? 15 + IDADES_SIMPLES - 1
    : primeiraIdade(grupo) + 4

/** A parte do grupo de idade que cai em [min, max], pelas idades simples. max = 80 é "80 ou mais". */
function fracaoDaIdade(
  idades: ReadonlyArray<number>,
  grupo: number,
  min: number,
  max: number,
): number {
  const a = primeiraIdade(grupo)
  const b = ultimaIdade(grupo)
  const de = Math.max(a, min)
  const ate = Math.min(b, max >= IDADE_PROCURADA_MAXIMA ? Infinity : max)
  if (ate < de) return 0
  let dentro = 0
  let todos = 0
  for (let idade = a; idade <= b; idade++) {
    const pessoas = idades[idade - 15] ?? 0
    todos += pessoas
    if (idade >= de && idade <= ate) dentro += pessoas
  }
  return todos > 0 ? dentro / todos : (ate - de + 1) / (b - a + 1)
}

/** A faixa da PNS em que cada grupo do Censo cai (o 15-19 vai para 18-24). */
const FAIXA_DA_PNS = [
  '18-24',
  '18-24',
  '25-29',
  '30-34',
  '35-39',
  '40-49',
  '40-49',
  '50-59',
  '50-59',
  '60-69',
  '60-69',
  '70+',
  '70+',
  '70+',
] as const

/** [mínimo, central, máximo]. */
type Intervalo = readonly [number, number, number]

function linhaDaPns(
  dados: DadosDoLugar,
  medida: string,
  sexo: number,
  grupo: number,
  categoria: string,
): Intervalo {
  const linha =
    dados.pns[`${medida}|${SEXOS[sexo]}|${FAIXA_DA_PNS[grupo]}|${categoria}`]
  if (!linha)
    throw new Error(
      `a PNS não tem ${medida} ${categoria} para ${SEXOS[sexo]} ${FAIXA_DA_PNS[grupo]}`,
    )
  const [p, min, max] = linha
  return [min, p, max]
}

/** P(a pessoa se interessa pelo gênero do visitante). Quem não soube ou não
 * quis responder é tratado como quem respondeu; o intervalo soma os das categorias. */
function orientacao(
  dados: DadosDoLugar,
  genero: 'homem' | 'mulher',
  sexo: number,
  grupo: number,
): { p: Intervalo; semResposta: number } {
  const mesmo = SEXOS[sexo] === genero
  const categorias = mesmo
    ? ['homossexual', 'bissexual']
    : ['heterossexual', 'bissexual']
  const semResposta =
    linhaDaPns(dados, 'orientacao', sexo, grupo, 'nao-sabe')[1] +
    linhaDaPns(dados, 'orientacao', sexo, grupo, 'recusou')[1]
  const soma = [0, 0, 0]
  for (const c of categorias) {
    const linha = linhaDaPns(dados, 'orientacao', sexo, grupo, c)
    for (let i = 0; i < 3; i++) soma[i]! += linha[i]!
  }
  const r = 1 - semResposta
  return {
    p: [soma[0]! / r, soma[1]! / r, Math.min(1, soma[2]! / r)],
    semResposta,
  }
}

/** P(altura em [min, max]) = F(max) − F(min − 1), com F acumulada da PNS. */
function altura(
  dados: DadosDoLugar,
  sexo: number,
  grupo: number,
  min: number,
  max: number,
): Intervalo {
  const acumulada = (cm: number): Intervalo =>
    linhaDaPns(dados, 'altura', sexo, grupo, `ate-${cm}`)
  const ate: Intervalo = max >= ALTURA_MAXIMA ? [1, 1, 1] : acumulada(max)
  const abaixo: Intervalo =
    min <= ALTURA_MINIMA ? [0, 0, 0] : acumulada(min - 1)
  const central = Math.max(0, ate[1] - abaixo[1])
  return [
    Math.min(central, Math.max(0, ate[0] - abaixo[2])),
    central,
    Math.max(central, Math.min(1, ate[2] - abaixo[0])),
  ]
}

function somaConjugal(dados: DadosDoLugar): Float64Array {
  const soma = new Float64Array(CELULAS_CONJUGAIS)
  for (let i = 0; i < dados.tamanho; i++)
    soma[indiceConjugal(dados.sexo[i]!, dados.grupo[i]!, dados.uniao[i]!)]! +=
      dados.peso[i]!
  return soma
}

interface Conta extends Contagem {
  /** Média ponderada de quem não respondeu a orientação, quando ela entra. */
  readonly semResposta: number
}

function contar(
  entrada: EntradaDaConta,
  dados: DadosDaConta,
  ligados: ReadonlySet<RequisitoId>,
): Conta {
  const { perfil, requisitos: r } = entrada
  const doLugar = ligados.has('lugar') ? dados.uf : dados.brasil
  if (!doLugar || (ligados.has('lugar') && doLugar.lugar !== r.lugar?.uf))
    throw new Error(`faltam os dados de ${r.lugar?.uf} para a conta`)

  // Tudo o que depende só de sexo × grupo (e união, no município) sai antes do laço.
  const idade = ligados.has('idade')
    ? idadeProcurada(perfil, r)
    : { min: IDADE_PROCURADA_MINIMA, max: IDADE_PROCURADA_MAXIMA }
  const { sexos } = quemSeProcura(perfil)
  const G = GRUPOS_DE_IDADE.length
  const fator = new Float64Array(SEXOS.length * G)
  const pns: Intervalo[] = []
  const semResposta = new Float64Array(SEXOS.length * G)
  for (const s of sexos) {
    const idades = (doLugar.idades as Idades)[SEXOS[s]!]
    for (let g = 0; g < G; g++) {
      const i = s * G + g
      fator[i] = fracaoDaIdade(
        idades,
        g,
        Math.max(IDADE_PROCURADA_MINIMA, idade.min),
        idade.max,
      )
      let p: [number, number, number] = [1, 1, 1]
      const vezes = (q: Intervalo) =>
        (p = [p[0] * q[0], p[1] * q[1], p[2] * q[2]])
      if (fator[i]! > 0) {
        if (
          ligados.has('orientacao') &&
          (perfil?.genero === 'homem' || perfil?.genero === 'mulher')
        ) {
          const o = orientacao(doLugar, perfil.genero, s, g)
          vezes(o.p)
          semResposta[i] = o.semResposta
        }
        if (ligados.has('altura'))
          vezes(altura(doLugar, s, g, r.altura.min, r.altura.max))
        if (ligados.has('fumo')) vezes(linhaDaPns(doLugar, 'fumo', s, g, 'nao'))
      }
      pns[i] = p
    }
  }

  let municipio: Float64Array | null = null
  if (ligados.has('lugar') && r.lugar?.municipio) {
    const m = doLugar.municipios.get(r.lugar.municipio)
    if (!m)
      throw new Error(
        `município ${r.lugar.municipio} fora dos dados de ${r.lugar.uf}`,
      )
    const daUf = somaConjugal(doLugar)
    municipio = new Float64Array(CELULAS_CONJUGAIS)
    for (let k = 0; k < CELULAS_CONJUGAIS; k++)
      municipio[k] = daUf[k]! > 0 ? (m.pessoas[k] ?? 0) / daUf[k]! : 0
  }

  const posicao = (lista: ReadonlyArray<string>, valor: string) =>
    lista.indexOf(valor) + 1
  const escolaridade =
    ligados.has('escolaridade') && r.escolaridade
      ? posicao(ESCOLARIDADES, r.escolaridade)
      : 0
  const renda = ligados.has('renda') && r.renda ? posicao(RENDAS, r.renda) : 0
  const cores = ligados.has('cor')
    ? new Set(r.cores.map((c) => posicao(CORES, c)))
    : null
  const religioes = ligados.has('religiao')
    ? new Set(r.religioes.map((c) => posicao(RELIGIOES, c)))
    : null
  const companheiro = ligados.has('companheiro')
  const semFilhos = ligados.has('filhos')
  const procuraUmSexo = sexos.length === 1 ? sexos[0] : -1

  let min = 0
  let central = 0
  let max = 0
  let registros = 0
  let somaSemResposta = 0
  let somaDosPesos = 0
  const d = doLugar
  for (let i = 0; i < d.tamanho; i++) {
    const s = d.sexo[i]!
    if (procuraUmSexo >= 0 && s !== procuraUmSexo) continue
    if (companheiro && d.uniao[i] === 1) continue
    if (d.escolaridade[i]! < escolaridade) continue
    if (d.renda[i]! < renda) continue
    if (cores && !cores.has(d.cor[i]!)) continue
    if (religioes && !religioes.has(d.religiao[i]!)) continue
    if (semFilhos && d.filhos[i] === 2) continue
    const sg = s * G + d.grupo[i]!
    let f = fator[sg]!
    if (municipio) f *= municipio[indiceConjugal(s, d.grupo[i]!, d.uniao[i]!)]!
    if (f === 0) continue
    const w = d.peso[i]! * f
    const p = pns[sg]!
    min += w * p[0]
    central += w * p[1]
    max += w * p[2]
    registros += d.registros[i]! * f
    somaSemResposta += w * semResposta[sg]!
    somaDosPesos += w
  }
  const erro = 1.96 / Math.sqrt(Math.max(registros, 1))
  return {
    min: min * Math.max(0, 1 - erro),
    central,
    max: max * (1 + erro),
    registros,
    semResposta: somaDosPesos > 0 ? somaSemResposta / somaDosPesos : 0,
  }
}

// --- ressalvas -------------------------------------------------------------

const porcento = (x: number) =>
  (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function ressalvas(
  entrada: EntradaDaConta,
  ligados: ReadonlyArray<RequisitoId>,
  resultado: Conta,
): Ressalva[] {
  const { perfil, requisitos } = entrada
  const tem = (k: RequisitoId) => ligados.includes(k)
  const lista: Array<Ressalva | false> = [
    resultado.registros < REGISTROS_PARA_ESTAVEL && {
      id: 'instavel',
      forte: true,
      texto: `Estimativa instável: a conta se apoia em só ${Math.round(resultado.registros)} registros da amostra do Censo.`,
    },
    perfil?.genero === 'outro' && {
      id: 'genero-outro',
      forte: true,
      texto:
        'O IBGE registra só o sexo e não pergunta identidade de gênero, então não dá para estimar quem se interessa por você. O número conta todas as pessoas do gênero procurado: é um teto.',
    },
    !perfil?.genero && {
      id: 'sem-genero',
      forte: true,
      texto:
        'Sem o seu gênero no Perfil, não dá para descontar quem não se interessa por você. O número conta todas as pessoas do gênero procurado: é um teto.',
    },
    !perfil?.procura && {
      id: 'sem-procura',
      forte: true,
      texto: 'Sem dizer quem você procura, a conta junta homens e mulheres.',
    },
    tem('filhos') &&
      quemSeProcura(perfil).filhos === 'so-mulheres' && {
        id: 'filhos-so-mulheres',
        forte: true,
        texto:
          'O Censo só pergunta filhos às mulheres: "sem filhos" vale para elas, e os homens entram com ou sem filhos.',
      },
    tem('companheiro') && {
      id: 'companheiro',
      forte: false,
      texto:
        '"Não mora com companheiro(a)" inclui quem namora: nenhuma pesquisa oficial pergunta sobre namoro.',
    },
    tem('orientacao') && {
      id: 'orientacao',
      forte: false,
      texto: `A orientação vem da PNS 2019, uma estatística experimental do IBGE. No grupo procurado, ${porcento(resultado.semResposta)}% não souberam ou não quiseram responder; a conta os trata como quem respondeu.`,
    },
    tem('idade') && {
      id: 'idade',
      forte: false,
      texto:
        'O microdado público traz a idade em grupos de 5 anos; a idade exata vem da proporção do SIDRA 9514.',
    },
    tem('lugar') &&
      !!requisitos.lugar?.municipio && {
        id: 'municipio',
        forte: false,
        texto:
          'No município, a composição do estado é aplicada à população da cidade por sexo, idade e união (SIDRA 10185). Escolaridade, renda, cor e religião seguem as do estado.',
      },
    tem('renda') && {
      id: 'renda',
      forte: false,
      texto:
        'A renda é a de julho de 2022, em salários mínimos da época (R$ 1.212).',
    },
    tem('altura') && {
      id: 'altura',
      forte: false,
      texto: 'A altura é autodeclarada na PNS 2019.',
    },
    ligados.some((k) => FONTE_DO_REQUISITO[k] === 'PNS') && {
      id: 'independencia',
      forte: false,
      texto:
        'Os Requisitos da PNS entram supondo que, dentro do mesmo sexo e idade, não dependem dos do Censo.',
    },
    {
      id: 'fonte',
      forte: false,
      texto: 'Censo de julho de 2022 e PNS 2019. Fonte: IBGE.',
    },
  ]
  return lista.filter((r): r is Ressalva => r !== false)
}

// --- a estimativa ----------------------------------------------------------

export function estimarGrupo(
  entrada: EntradaDaConta,
  dados: DadosDaConta,
): Estimativa {
  const ligados = requisitosLigados(entrada)
  const com = (lista: ReadonlyArray<RequisitoId>) =>
    contar(entrada, dados, new Set(lista))
  const atual = com(ligados)
  const base = com([])

  const funil = ligados.map((requisito, i) => ({
    requisito,
    central: com(ligados.slice(0, i + 1)).central,
  }))

  const custos = ligados
    .filter((k) => k !== 'orientacao')
    .map((requisito): Custo => {
      const sem = com(ligados.filter((k) => k !== requisito)).central
      const vezes =
        atual.central > 0 ? sem / atual.central : sem > 0 ? Infinity : 1
      return { requisito, sem, ganho: sem - atual.central, vezes }
    })
    .sort((a, b) => b.vezes - a.vezes)

  const ingenua =
    base.central > 0
      ? ligados.reduce(
          (v, k) => v * (com([k]).central / base.central),
          base.central,
        )
      : 0

  const { semResposta: _, ...resultado } = atual
  const { semResposta: __, ...daBase } = base
  const procurado = quemSeProcura(entrada.perfil)
  return {
    alvo: procurado.alvo,
    ligados,
    resultado: {
      ...resultado,
      instavel: atual.registros < REGISTROS_PARA_ESTAVEL,
    },
    base: daBase,
    custos,
    funil,
    ingenua,
    ressalvas: ressalvas(entrada, ligados, atual),
    filhos: procurado.filhos,
  }
}
