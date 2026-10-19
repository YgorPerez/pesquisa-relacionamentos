// Refaz os dados do Grupo possível (#36): `pnpm dados:grupo-possivel`.
//
// 1. Baixa para o cache (fora do repositório) os microdados da amostra do
//    Censo 2022 e da PNS 2019, se ainda não estiverem lá.
// 2. Pede ao SIDRA a população por UF (9514) e o estado conjugal (10185).
// 3. Agrega o Censo e lê a PNS.
// 4. Confere os dois contra os números publicados. Se algo não bate, sai com
//    erro antes de gravar qualquer arquivo.
// 5. Grava em `dados/grupo-possivel/` o CSV do Censo, as probabilidades da
//    PNS e as tabelas do SIDRA para a idade exata e o município (população
//    na 9514, estado conjugal na 10185), cada um com o seu `.meta.yaml`.
//
// `--so-municipios` refaz só o estado conjugal por município, sem baixar os
// microdados.
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { arquivosDoZip, baixar, FTP, linhasDoZip, PASTA_BRUTOS } from './brutos.ts'
import { agregarPessoas, celulasEmCsv, GRUPOS_DE_IDADE, UFS } from './censo.ts'
import { conferir, conferirPns, TOLERANCIA_BRASIL, TOLERANCIA_UF, type CelulaConjugal } from './conferencia.ts'
import { estimarPns, lerRegistroPns, pnsEmCsv, type RegistroPns } from './pns.ts'
import { conferirMunicipios, municipiosEmCsv, type ConjugalDoMunicipio } from './municipios.ts'
import { buscarSidra, type ValorSidra } from './sidra.ts'

const RAIZ = join(import.meta.dirname, '..', '..')
const SAIDA = join(RAIZ, 'dados', 'grupo-possivel')
const SCRIPT = relative(RAIZ, import.meta.filename)

const FICHA_CENSO = 'ibge-2022-censo-amostra'
const FICHA_PNS = 'ibge-2019-pns'

const URL_CENSO = `${FTP}/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Microdados_de_acesso_Publico/csv/Todas_as_UFs.zip`
const URL_PNS = `${FTP}/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip`

const hoje = () => new Date().toISOString().slice(0, 10)
const dataDoArquivo = (caminho: string) => statSync(caminho).mtime.toISOString().slice(0, 10)

/** A data de publicação do arquivo no FTP, que serve de versão. */
async function publicadoEm(url: string): Promise<string> {
  const resposta = await fetch(url, { method: 'HEAD' })
  const data = resposta.headers.get('last-modified')
  return data ? new Date(data).toISOString().slice(0, 10) : 'desconhecida'
}

const SIGLA_POR_CODIGO: Readonly<Record<string, string>> = { ...UFS, '1': 'BR' }

// --- SIDRA ---------------------------------------------------------------

/** Os códigos da classificação 287 (idade) da tabela 9514, lidos dos metadados. */
async function idadesDa9514(): Promise<{ simples: Map<string, string>; grupos: Map<string, string> }> {
  const resposta = await fetch('https://servicodados.ibge.gov.br/api/v3/agregados/9514/metadados')
  const meta = (await resposta.json()) as {
    classificacoes: Array<{ id: number; categorias: Array<{ id: number; nome: string; nivel: number }> }>
  }
  const idade = meta.classificacoes.find((c) => c.id === 287)
  if (!idade) throw new Error('a tabela 9514 não tem mais a classificação 287 (idade)')
  const simples = new Map<string, string>()
  const grupos = new Map<string, string>()
  for (const c of idade.categorias) {
    const ano = /^(\d+) anos?$/.exec(c.nome)
    if (ano && c.nivel === 2 && Number(ano[1]) >= 15) simples.set(String(c.id), ano[1]!)
    if (c.nome === '100 anos ou mais') {
      simples.set(String(c.id), '100+')
      grupos.set(String(c.id), '80+')
    }
    const grupo = /^(\d+) a (\d+) anos$/.exec(c.nome)
    if (grupo && c.nivel === 1 && Number(grupo[1]) >= 15)
      grupos.set(String(c.id), Number(grupo[1]) >= 80 ? '80+' : `${grupo[1]}-${grupo[2]}`)
  }
  if (simples.size !== 86) throw new Error(`esperava 86 idades simples (15 a 100+) na 9514, vieram ${simples.size}`)
  return { simples, grupos }
}

const SEXO_SIDRA: Readonly<Record<string, string>> = { '4': 'homem', '5': 'mulher' }

async function populacaoPorUf(): Promise<Record<string, number>> {
  const valores = await buscarSidra(9514, 93, 'N3[all]', ['2[6794]', '287[100362]', '286[113635]'])
  return Object.fromEntries(valores.map((v) => [SIGLA_POR_CODIGO[v.local] ?? v.local, v.valor]))
}

/** Os grupos de idade da classificação 58 da tabela 10185. */
const GRUPOS_10185: Readonly<Record<string, string>> = {
  '1143': '15-19', '1144': '20-24', '1145': '25-29', '1146': '30-34', '1147': '35-39', '1148': '40-44',
  '1149': '45-49', '1150': '50-54', '1151': '55-59', '1152': '60-64', '1153': '65-69', '1154': '70-74',
  '1155': '75-79', '2503': '80+',
}
const CLASSIFICACOES_10185 = ['464[12108,12109]', '2[4,5]', `58[${Object.keys(GRUPOS_10185).join(',')}]`, '86[95251]']

function celulaConjugal(v: ValorSidra): Omit<CelulaConjugal, 'local'> {
  const [conjugal = '', sexo = '', grupo = ''] = v.categorias
  return {
    sexo: SEXO_SIDRA[sexo] ?? sexo,
    idade: GRUPOS_10185[grupo] ?? grupo,
    uniao: conjugal === '12108' ? 'sim' : 'nao',
    pessoas: v.valor,
  }
}

/** SIDRA 10185, cor ou raça total, a partir de 15 anos, Brasil e UFs. */
async function estadoConjugal(): Promise<CelulaConjugal[]> {
  const valores = await buscarSidra(10185, 140, 'N1[all]|N3[all]', CLASSIFICACOES_10185)
  return valores.map((v) => ({ local: SIGLA_POR_CODIGO[v.local] ?? v.local, ...celulaConjugal(v) }))
}

/** SIDRA 10185 por município, uma consulta por UF. */
async function estadoConjugalPorMunicipio(): Promise<ConjugalDoMunicipio[]> {
  const municipios: ConjugalDoMunicipio[] = []
  for (const codigoUf of Object.keys(UFS)) {
    const valores = await buscarSidra(10185, 140, `N6[N3[${codigoUf}]]`, CLASSIFICACOES_10185)
    const porMunicipio = new Map<string, { nome: string; pessoas: Map<string, number> }>()
    for (const v of valores) {
      const m = porMunicipio.get(v.local) ?? { nome: v.nome.replace(/ \([A-Z]{2}\)$| - [A-Z]{2}$/, ''), pessoas: new Map() }
      porMunicipio.set(v.local, m)
      const c = celulaConjugal(v)
      m.pessoas.set(`${c.sexo}_${c.idade}_${c.uniao}`, c.pessoas)
    }
    for (const [codigo, m] of porMunicipio) municipios.push({ codigo, nome: m.nome, uf: UFS[codigoUf]!, pessoas: m.pessoas })
  }
  return municipios
}

const META_10185_MUNICIPIOS = (total: number) => ({
  ficha: FICHA_CENSO,
  tabela: ['SIDRA 10185'],
  variaveis: ['140 Pessoas de 10 anos ou mais de idade', '464 Estado conjugal (viviam ou não em união)', '2 Sexo', '58 Grupo de idade (15 anos ou mais)', '86 Cor ou raça (total)'],
  baixado_em: hoje(),
  versao: `Censo 2022, amostra, ${total} municípios`,
  conferencia: 'A soma dos municípios dá a UF publicada na mesma tabela, em cada sexo × grupo de idade × união.',
})

/** `--so-municipios`: refaz só o estado conjugal por município, sem os microdados. */
async function soMunicipios() {
  const [conjugal, municipios] = await Promise.all([estadoConjugal(), estadoConjugalPorMunicipio()])
  const falhas = conferirMunicipios(municipios, conjugal)
  if (falhas.length > 0) {
    console.error(`Os municípios não fecham com as UFs; nada foi gravado.\n${falhas.join('\n')}`)
    process.exit(1)
  }
  mkdirSync(SAIDA, { recursive: true })
  gravar('sidra-10185-municipios', municipiosEmCsv(municipios), META_10185_MUNICIPIOS(municipios.length))
}

/** População por sexo e idade simples (15 a 100+), Brasil e UFs. */
async function idadeSimples(simples: Map<string, string>): Promise<string> {
  const valores = await buscarSidra(9514, 93, 'N1[all]|N3[all]', [
    '2[4,5]',
    `287[${[...simples.keys()].join(',')}]`,
    '286[113635]',
  ])
  const ordemIdade = (idade: string) => Number.parseInt(idade, 10)
  const linhas = valores
    .map((v) => ({
      local: SIGLA_POR_CODIGO[v.local] ?? v.local,
      sexo: SEXO_SIDRA[v.categorias[0] ?? ''] ?? '',
      idade: simples.get(v.categorias[1] ?? '') ?? '',
      pessoas: v.valor,
    }))
    .sort((a, b) => a.local.localeCompare(b.local) || a.sexo.localeCompare(b.sexo) || ordemIdade(a.idade) - ordemIdade(b.idade))
  return ['local,sexo,idade,pessoas', ...linhas.map((l) => `${l.local},${l.sexo},${l.idade},${l.pessoas}`)].join('\n') + '\n'
}

// Pelas chaves ordenadas: `Object.values` poria '10'…'17' antes de '04'.
const ORDEM_GRUPOS = Object.keys(GRUPOS_DE_IDADE)
  .sort()
  .map((codigo) => GRUPOS_DE_IDADE[codigo])

/** População dos municípios por sexo × grupo de idade (15+), uma linha por município. */
async function municipios(grupos: Map<string, string>): Promise<{ csv: string; total: number }> {
  const colunas = (['homem', 'mulher'] as const).flatMap((s) => ORDEM_GRUPOS.map((g) => `${s}_${g}`))
  const linhas: string[] = []
  for (const codigoUf of Object.keys(UFS)) {
    const valores: ValorSidra[] = await buscarSidra(9514, 93, `N6[N3[${codigoUf}]]`, [
      '2[4,5]',
      `287[${[...grupos.keys()].join(',')}]`,
      '286[113635]',
    ])
    const porMunicipio = new Map<string, { nome: string; pessoas: Map<string, number> }>()
    for (const v of valores) {
      const m = porMunicipio.get(v.local) ?? { nome: v.nome.replace(/ - [A-Z]{2}$/, ''), pessoas: new Map() }
      porMunicipio.set(v.local, m)
      const coluna = `${SEXO_SIDRA[v.categorias[0] ?? '']}_${grupos.get(v.categorias[1] ?? '')}`
      m.pessoas.set(coluna, (m.pessoas.get(coluna) ?? 0) + v.valor)
    }
    for (const [codigo, m] of [...porMunicipio].sort(([a], [b]) => a.localeCompare(b))) {
      if (m.nome.includes(',')) throw new Error(`nome de município com vírgula: ${m.nome}`)
      linhas.push([codigo, m.nome, UFS[codigoUf], ...colunas.map((c) => m.pessoas.get(c) ?? 0)].join(','))
    }
  }
  return { csv: [['municipio', 'nome', 'uf', ...colunas].join(','), ...linhas].join('\n') + '\n', total: linhas.length }
}

// --- .meta.yaml ----------------------------------------------------------

interface Meta {
  readonly ficha: string
  readonly tabela?: ReadonlyArray<string>
  readonly variaveis?: ReadonlyArray<string>
  readonly baixado_em: string
  readonly versao: string
  readonly conferencia?: string
}

const aspas = (texto: string) => JSON.stringify(texto)

function metaEmYaml(meta: Meta): string {
  const lista = (itens: ReadonlyArray<string>) => `[${itens.map(aspas).join(', ')}]`
  return [
    `# Gerado por ${SCRIPT}. Não edite à mão: rode \`pnpm dados:grupo-possivel\`.`,
    `ficha: ${meta.ficha}`,
    meta.tabela ? `tabela: ${lista(meta.tabela)}` : null,
    meta.variaveis ? `variaveis: ${lista(meta.variaveis)}` : null,
    `baixado_em: ${meta.baixado_em}`,
    `script: ${SCRIPT}`,
    `versao: ${aspas(meta.versao)}`,
    meta.conferencia ? `conferencia: ${aspas(meta.conferencia)}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n') + '\n'
}

function gravar(nome: string, conteudo: string, meta: Meta) {
  writeFileSync(join(SAIDA, `${nome}.csv`), conteudo)
  writeFileSync(join(SAIDA, `${nome}.meta.yaml`), metaEmYaml(meta))
  console.log(`gravado dados/grupo-possivel/${nome}.csv`)
}

// --- principal -----------------------------------------------------------

async function principal() {
  const zipCenso = await baixar(URL_CENSO, join(PASTA_BRUTOS, 'censo', 'Todas_as_UFs.zip'))
  const zipPns = await baixar(URL_PNS, join(PASTA_BRUTOS, 'pns', 'PNS_2019_20220525.zip'))

  console.log('consultando o SIDRA')
  const { simples, grupos } = await idadesDa9514()
  const [populacao, conjugal, csvIdade, csvMunicipios, conjugalMunicipios] = await Promise.all([
    populacaoPorUf(),
    estadoConjugal(),
    idadeSimples(simples),
    municipios(grupos),
    estadoConjugalPorMunicipio(),
  ])

  console.log('agregando o Censo')
  const arquivos = (await arquivosDoZip(zipCenso)).filter((n) => /^Pessoas_\d\d_publico\.csv$/.test(n)).sort()
  if (arquivos.length !== 27) throw new Error(`esperava 27 arquivos de pessoas no zip, vieram ${arquivos.length}`)
  async function* todasAsPessoas() {
    for (const arquivo of arquivos) yield* linhasDoZip(zipCenso, arquivo)
  }
  const agregado = await agregarPessoas(todasAsPessoas())

  console.log('lendo a PNS')
  const registros: RegistroPns[] = []
  for await (const linha of linhasDoZip(zipPns, 'PNS_2019.txt')) {
    const registro = lerRegistroPns(linha)
    if (registro) registros.push(registro)
  }

  const conferencia = conferir(agregado, { populacao, conjugal })
  const falhas = [...conferencia.falhas, ...conferirPns(registros), ...conferirMunicipios(conjugalMunicipios, conjugal)]
  if (falhas.length > 0) {
    console.error(`A conferência contra o que o IBGE publicou falhou; nada foi gravado.\n${falhas.join('\n')}`)
    process.exit(1)
  }
  const pct = (x: number) => (x * 100).toFixed(2).replace('.', ',')
  console.log(
    `conferido: ${conferencia.celulasConferidas} células do SIDRA 10185; maior diferença no Brasil ${pct(conferencia.maiorDiferencaBrasil)}%, nas UFs ${pct(conferencia.maiorDiferencaUf)} pontos`,
  )

  mkdirSync(SAIDA, { recursive: true })
  const [versaoCenso, versaoPns] = await Promise.all([publicadoEm(URL_CENSO), publicadoEm(URL_PNS)])

  gravar('censo-2022', celulasEmCsv(agregado.celulas), {
    ficha: FICHA_CENSO,
    tabela: ['Microdados da amostra, acesso público, arquivo de pessoas'],
    variaveis: ['P0020', 'P0110', 'P0150', 'P0180', 'P0210', 'P0280', 'P0340', 'P0410', 'P0760', 'P1110'],
    baixado_em: dataDoArquivo(zipCenso),
    versao: `Todas_as_UFs.zip publicado em ${versaoCenso}`,
    conferencia:
      `Soma dos pesos igual à população de cada UF (SIDRA 9514). SIDRA 10185, estado conjugal por sexo e grupo de idade: ` +
      `maior diferença de ${pct(conferencia.maiorDiferencaBrasil)}% no Brasil (tolerância ${pct(TOLERANCIA_BRASIL)}%) ` +
      `e de ${pct(conferencia.maiorDiferencaUf)} pontos na proporção sem união nas UFs (tolerância ${pct(TOLERANCIA_UF)}). ` +
      `Fora do CSV: ${agregado.descartados.sexoOuIdadeIgnorados.registros} registros com sexo ou idade suprimidos.`,
  })
  gravar('pns-2019', pnsEmCsv(estimarPns(registros)), {
    ficha: FICHA_PNS,
    tabela: ['Microdados da PNS 2019, morador selecionado de 18 anos ou mais'],
    variaveis: ['V0024', 'UPA_PNS', 'V00291', 'M001', 'C006', 'C008', 'Y008', 'P00404', 'P050'],
    baixado_em: dataDoArquivo(zipPns),
    versao: `PNS_2019_20220525.zip publicado em ${versaoPns}`,
    conferencia: 'Orientação sexual por sexo igual à Tabela 1.1.1 da PNS 2019 na casa decimal publicada.',
  })
  gravar('sidra-9514-idade', csvIdade, {
    ficha: FICHA_CENSO,
    tabela: ['SIDRA 9514'],
    variaveis: ['93 População residente', '2 Sexo', '287 Idade (15 a 100 anos ou mais)'],
    baixado_em: hoje(),
    versao: 'Censo 2022, universo',
  })
  gravar('sidra-9514-municipios', csvMunicipios.csv, {
    ficha: FICHA_CENSO,
    tabela: ['SIDRA 9514'],
    variaveis: ['93 População residente', '2 Sexo', '287 Idade (grupos de 5 anos a partir de 15, 80 ou mais somados)'],
    baixado_em: hoje(),
    versao: `Censo 2022, universo, ${csvMunicipios.total} municípios`,
  })
  gravar('sidra-10185-municipios', municipiosEmCsv(conjugalMunicipios), META_10185_MUNICIPIOS(conjugalMunicipios.length))
}

await (process.argv.includes('--so-municipios') ? soMunicipios() : principal())
