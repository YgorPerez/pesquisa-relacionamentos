// Rebuilds the possible group data (#36): `pnpm data:possible-group`.
//
// 1. Downloads the 2022 Census sample microdata and the PNS 2019 to the cache
//    (outside the repository), unless they are already there.
// 2. Asks SIDRA for the population by state (9514) and marital status (10185).
// 3. Aggregates the Census and reads the PNS.
// 4. Cross-checks both against the published numbers. If anything does not
//    match, exits with an error before writing any file.
// 5. Writes to `data/possible-group/` the Census CSV, the PNS probabilities
//    and the SIDRA tables for exact age and municipality (population from
//    9514, marital status from 10185), each with its `.meta.yaml`.
//
// `--municipalities-only` rebuilds only marital status by municipality,
// without downloading the microdata.
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { download, FTP, RAW_DIR, zipEntries, zipLines } from './raw.ts'
import {
  AGE_GROUPS,
  aggregatePeople,
  cellsToCsv,
  STATE_CODES,
} from './census.ts'
import {
  BRAZIL_TOLERANCE,
  crossCheck,
  crossCheckPns,
  STATE_TOLERANCE,
  type MaritalCell,
} from './cross-check.ts'
import { estimatePns, pnsToCsv, readPnsRecord, type PnsRecord } from './pns.ts'
import {
  crossCheckMunicipalities,
  municipalitiesToCsv,
  type MunicipalityMarital,
} from './municipalities.ts'
import { fetchSidra, type SidraValue } from './sidra.ts'

const ROOT = join(import.meta.dirname, '..', '..')
const OUTPUT = join(ROOT, 'data', 'possible-group')
const SCRIPT = relative(ROOT, import.meta.filename)

const CENSUS_FACT_SHEET = 'ibge-2022-censo-amostra'
const PNS_FACT_SHEET = 'ibge-2019-pns'

const CENSUS_URL = `${FTP}/Censos/Censo_Demografico_2022/Microdados_e_Areas_de_Ponderacao/Microdados_de_acesso_Publico/csv/Todas_as_UFs.zip`
const PNS_URL = `${FTP}/PNS/2019/Microdados/Dados/PNS_2019_20220525.zip`

const today = () => new Date().toISOString().slice(0, 10)
const fileDate = (path: string) =>
  statSync(path).mtime.toISOString().slice(0, 10)

/** The file's publication date on the FTP, which serves as its version. */
async function publishedOn(url: string): Promise<string> {
  const response = await fetch(url, { method: 'HEAD' })
  const date = response.headers.get('last-modified')
  return date ? new Date(date).toISOString().slice(0, 10) : 'desconhecida'
}

const ABBREVIATION_BY_CODE: Readonly<Record<string, string>> = {
  ...STATE_CODES,
  '1': 'BR',
}

// --- SIDRA ---------------------------------------------------------------

/** The codes of classification 287 (age) in table 9514, read from its metadata. */
async function agesOf9514(): Promise<{
  single: Map<string, string>
  groups: Map<string, string>
}> {
  const response = await fetch(
    'https://servicodados.ibge.gov.br/api/v3/agregados/9514/metadados',
  )
  const meta = (await response.json()) as {
    classificacoes: Array<{
      id: number
      categorias: Array<{ id: number; nome: string; nivel: number }>
    }>
  }
  const age = meta.classificacoes.find((c) => c.id === 287)
  if (!age) throw new Error('table 9514 no longer has classification 287 (age)')
  const single = new Map<string, string>()
  const groups = new Map<string, string>()
  for (const c of age.categorias) {
    const year = /^(\d+) anos?$/.exec(c.nome)
    if (year && c.nivel === 2 && Number(year[1]) >= 15)
      single.set(String(c.id), year[1]!)
    if (c.nome === '100 anos ou mais') {
      single.set(String(c.id), '100+')
      groups.set(String(c.id), '80+')
    }
    const group = /^(\d+) a (\d+) anos$/.exec(c.nome)
    if (group && c.nivel === 1 && Number(group[1]) >= 15)
      groups.set(
        String(c.id),
        Number(group[1]) >= 80 ? '80+' : `${group[1]}-${group[2]}`,
      )
  }
  if (single.size !== 86)
    throw new Error(
      `expected 86 single ages (15 to 100+) in 9514, got ${single.size}`,
    )
  return { single, groups }
}

const SIDRA_SEX: Readonly<Record<string, string>> = {
  '4': 'homem',
  '5': 'mulher',
}

async function populationByState(): Promise<Record<string, number>> {
  const values = await fetchSidra(9514, 93, 'N3[all]', [
    '2[6794]',
    '287[100362]',
    '286[113635]',
  ])
  return Object.fromEntries(
    values.map((v) => [ABBREVIATION_BY_CODE[v.place] ?? v.place, v.value]),
  )
}

/** The age groups of classification 58 in table 10185. */
const GROUPS_10185: Readonly<Record<string, string>> = {
  '1143': '15-19',
  '1144': '20-24',
  '1145': '25-29',
  '1146': '30-34',
  '1147': '35-39',
  '1148': '40-44',
  '1149': '45-49',
  '1150': '50-54',
  '1151': '55-59',
  '1152': '60-64',
  '1153': '65-69',
  '1154': '70-74',
  '1155': '75-79',
  '2503': '80+',
}
const CLASSIFICATIONS_10185 = [
  '464[12108,12109]',
  '2[4,5]',
  `58[${Object.keys(GROUPS_10185).join(',')}]`,
  '86[95251]',
]

function maritalCell(v: SidraValue): Omit<MaritalCell, 'place'> {
  const [marital = '', sex = '', group = ''] = v.categories
  return {
    sex: SIDRA_SEX[sex] ?? sex,
    age: GROUPS_10185[group] ?? group,
    union: marital === '12108' ? 'sim' : 'nao',
    people: v.value,
  }
}

/** SIDRA 10185, all races, from age 15 up, Brazil and states. */
async function maritalStatus(): Promise<MaritalCell[]> {
  const values = await fetchSidra(
    10185,
    140,
    'N1[all]|N3[all]',
    CLASSIFICATIONS_10185,
  )
  return values.map((v) => ({
    place: ABBREVIATION_BY_CODE[v.place] ?? v.place,
    ...maritalCell(v),
  }))
}

/** SIDRA 10185 by municipality, one query per state. */
async function maritalStatusByMunicipality(): Promise<MunicipalityMarital[]> {
  const municipalities: MunicipalityMarital[] = []
  for (const stateCode of Object.keys(STATE_CODES)) {
    const values = await fetchSidra(
      10185,
      140,
      `N6[N3[${stateCode}]]`,
      CLASSIFICATIONS_10185,
    )
    const byMunicipality = new Map<
      string,
      { name: string; people: Map<string, number> }
    >()
    for (const v of values) {
      const m = byMunicipality.get(v.place) ?? {
        name: v.name.replace(/ \([A-Z]{2}\)$| - [A-Z]{2}$/, ''),
        people: new Map(),
      }
      byMunicipality.set(v.place, m)
      const c = maritalCell(v)
      m.people.set(`${c.sex}_${c.age}_${c.union}`, c.people)
    }
    for (const [code, m] of byMunicipality)
      municipalities.push({
        code,
        name: m.name,
        state: STATE_CODES[stateCode]!,
        people: m.people,
      })
  }
  return municipalities
}

const META_10185_MUNICIPALITIES = (total: number) => ({
  fact_sheet: CENSUS_FACT_SHEET,
  table: ['SIDRA 10185'],
  variables: [
    '140 Pessoas de 10 anos ou mais de idade',
    '464 Estado conjugal (viviam ou não em união)',
    '2 Sexo',
    '58 Grupo de idade (15 anos ou mais)',
    '86 Cor ou raça (total)',
  ],
  downloaded_on: today(),
  version: `Censo 2022, amostra, ${total} municípios`,
  cross_check:
    'A soma dos municípios dá a UF publicada na mesma tabela, em cada sexo × grupo de idade × união.',
})

/** `--municipalities-only`: rebuilds only marital status by municipality, without the microdata. */
async function municipalitiesOnly() {
  const [marital, municipalities] = await Promise.all([
    maritalStatus(),
    maritalStatusByMunicipality(),
  ])
  const failures = crossCheckMunicipalities(municipalities, marital)
  if (failures.length > 0) {
    console.error(
      `The municipalities do not add up to the states; nothing was written.\n${failures.join('\n')}`,
    )
    process.exit(1)
  }
  mkdirSync(OUTPUT, { recursive: true })
  write(
    'sidra-10185-municipios',
    municipalitiesToCsv(municipalities),
    META_10185_MUNICIPALITIES(municipalities.length),
  )
}

/** Population by sex and single age (15 to 100+), Brazil and states. */
async function singleAge(single: Map<string, string>): Promise<string> {
  const values = await fetchSidra(9514, 93, 'N1[all]|N3[all]', [
    '2[4,5]',
    `287[${[...single.keys()].join(',')}]`,
    '286[113635]',
  ])
  const ageOrder = (age: string) => Number.parseInt(age, 10)
  const rows = values
    .map((v) => ({
      place: ABBREVIATION_BY_CODE[v.place] ?? v.place,
      sex: SIDRA_SEX[v.categories[0] ?? ''] ?? '',
      age: single.get(v.categories[1] ?? '') ?? '',
      people: v.value,
    }))
    .sort(
      (a, b) =>
        a.place.localeCompare(b.place) ||
        a.sex.localeCompare(b.sex) ||
        ageOrder(a.age) - ageOrder(b.age),
    )
  return (
    [
      'local,sexo,idade,pessoas',
      ...rows.map((l) => `${l.place},${l.sex},${l.age},${l.people}`),
    ].join('\n') + '\n'
  )
}

// By sorted keys: `Object.values` would put '10'…'17' before '04'.
const GROUP_ORDER = Object.keys(AGE_GROUPS)
  .sort()
  .map((code) => AGE_GROUPS[code])

/** Municipal population by sex × age group (15+), one line per municipality. */
async function municipalities(
  groups: Map<string, string>,
): Promise<{ csv: string; total: number }> {
  const columns = (['homem', 'mulher'] as const).flatMap((s) =>
    GROUP_ORDER.map((g) => `${s}_${g}`),
  )
  const lines: string[] = []
  for (const stateCode of Object.keys(STATE_CODES)) {
    const values: SidraValue[] = await fetchSidra(
      9514,
      93,
      `N6[N3[${stateCode}]]`,
      ['2[4,5]', `287[${[...groups.keys()].join(',')}]`, '286[113635]'],
    )
    const byMunicipality = new Map<
      string,
      { name: string; people: Map<string, number> }
    >()
    for (const v of values) {
      const m = byMunicipality.get(v.place) ?? {
        name: v.name.replace(/ - [A-Z]{2}$/, ''),
        people: new Map(),
      }
      byMunicipality.set(v.place, m)
      const column = `${SIDRA_SEX[v.categories[0] ?? '']}_${groups.get(v.categories[1] ?? '')}`
      m.people.set(column, (m.people.get(column) ?? 0) + v.value)
    }
    for (const [code, m] of [...byMunicipality].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      if (m.name.includes(','))
        throw new Error(`municipality name with a comma: ${m.name}`)
      lines.push(
        [
          code,
          m.name,
          STATE_CODES[stateCode],
          ...columns.map((c) => m.people.get(c) ?? 0),
        ].join(','),
      )
    }
  }
  return {
    csv:
      [['municipio', 'nome', 'uf', ...columns].join(','), ...lines].join('\n') +
      '\n',
    total: lines.length,
  }
}

// --- .meta.yaml ----------------------------------------------------------

/** The `.meta.yaml` keys, the content contract's (`DataMeta`). */
interface Meta {
  readonly fact_sheet: string
  readonly table?: ReadonlyArray<string>
  readonly variables?: ReadonlyArray<string>
  readonly downloaded_on: string
  readonly version: string
  readonly cross_check?: string
}

const quote = (text: string) => JSON.stringify(text)

function metaToYaml(meta: Meta): string {
  const list = (items: ReadonlyArray<string>) =>
    `[${items.map(quote).join(', ')}]`
  return (
    [
      `# Gerado por ${SCRIPT}. Não edite à mão: rode \`pnpm data:possible-group\`.`,
      `fact_sheet: ${meta.fact_sheet}`,
      meta.table ? `table: ${list(meta.table)}` : null,
      meta.variables ? `variables: ${list(meta.variables)}` : null,
      `downloaded_on: ${meta.downloaded_on}`,
      `script: ${SCRIPT}`,
      `version: ${quote(meta.version)}`,
      meta.cross_check ? `cross_check: ${quote(meta.cross_check)}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n') + '\n'
  )
}

function write(name: string, content: string, meta: Meta) {
  writeFileSync(join(OUTPUT, `${name}.csv`), content)
  writeFileSync(join(OUTPUT, `${name}.meta.yaml`), metaToYaml(meta))
  console.log(`wrote data/possible-group/${name}.csv`)
}

// --- main ----------------------------------------------------------------

async function main() {
  const censusZip = await download(
    CENSUS_URL,
    join(RAW_DIR, 'censo', 'Todas_as_UFs.zip'),
  )
  const pnsZip = await download(
    PNS_URL,
    join(RAW_DIR, 'pns', 'PNS_2019_20220525.zip'),
  )

  console.log('querying SIDRA')
  const { single, groups } = await agesOf9514()
  const [
    population,
    marital,
    ageCsv,
    municipalitiesCsv,
    maritalMunicipalities,
  ] = await Promise.all([
    populationByState(),
    maritalStatus(),
    singleAge(single),
    municipalities(groups),
    maritalStatusByMunicipality(),
  ])

  console.log('aggregating the Census')
  const files = (await zipEntries(censusZip))
    .filter((n) => /^Pessoas_\d\d_publico\.csv$/.test(n))
    .sort()
  if (files.length !== 27)
    throw new Error(`expected 27 people files in the zip, got ${files.length}`)
  async function* allPeople() {
    for (const file of files) yield* zipLines(censusZip, file)
  }
  const aggregate = await aggregatePeople(allPeople())

  console.log('reading the PNS')
  const records: PnsRecord[] = []
  for await (const line of zipLines(pnsZip, 'PNS_2019.txt')) {
    const record = readPnsRecord(line)
    if (record) records.push(record)
  }

  const check = crossCheck(aggregate, { population, marital })
  const failures = [
    ...check.failures,
    ...crossCheckPns(records),
    ...crossCheckMunicipalities(maritalMunicipalities, marital),
  ]
  if (failures.length > 0) {
    console.error(
      `The cross-check against what IBGE published failed; nothing was written.\n${failures.join('\n')}`,
    )
    process.exit(1)
  }
  const pct = (x: number) => (x * 100).toFixed(2).replace('.', ',')
  console.log(
    `checked: ${check.checkedCells} cells of SIDRA 10185; largest difference in Brazil ${pct(check.maxDifferenceBrazil)}%, across states ${pct(check.maxDifferenceState)} points`,
  )

  mkdirSync(OUTPUT, { recursive: true })
  const [censusVersion, pnsVersion] = await Promise.all([
    publishedOn(CENSUS_URL),
    publishedOn(PNS_URL),
  ])

  write('censo-2022', cellsToCsv(aggregate.cells), {
    fact_sheet: CENSUS_FACT_SHEET,
    table: ['Microdados da amostra, acesso público, arquivo de pessoas'],
    variables: [
      'P0020',
      'P0110',
      'P0150',
      'P0180',
      'P0210',
      'P0280',
      'P0340',
      'P0410',
      'P0760',
      'P1110',
    ],
    downloaded_on: fileDate(censusZip),
    version: `Todas_as_UFs.zip publicado em ${censusVersion}`,
    cross_check:
      `Soma dos pesos igual à população de cada UF (SIDRA 9514). SIDRA 10185, estado conjugal por sexo e grupo de idade: ` +
      `maior diferença de ${pct(check.maxDifferenceBrazil)}% no Brasil (tolerância ${pct(BRAZIL_TOLERANCE)}%) ` +
      `e de ${pct(check.maxDifferenceState)} pontos na proporção sem união nas UFs (tolerância ${pct(STATE_TOLERANCE)}). ` +
      `Fora do CSV: ${aggregate.discarded.sexOrAgeSuppressed.records} registros com sexo ou idade suprimidos.`,
  })
  write('pns-2019', pnsToCsv(estimatePns(records)), {
    fact_sheet: PNS_FACT_SHEET,
    table: ['Microdados da PNS 2019, morador selecionado de 18 anos ou mais'],
    variables: [
      'V0024',
      'UPA_PNS',
      'V00291',
      'M001',
      'C006',
      'C008',
      'Y008',
      'P00404',
      'P050',
    ],
    downloaded_on: fileDate(pnsZip),
    version: `PNS_2019_20220525.zip publicado em ${pnsVersion}`,
    cross_check:
      'Orientação sexual por sexo igual à Tabela 1.1.1 da PNS 2019 na casa decimal publicada.',
  })
  write('sidra-9514-idade', ageCsv, {
    fact_sheet: CENSUS_FACT_SHEET,
    table: ['SIDRA 9514'],
    variables: [
      '93 População residente',
      '2 Sexo',
      '287 Idade (15 a 100 anos ou mais)',
    ],
    downloaded_on: today(),
    version: 'Censo 2022, universo',
  })
  write('sidra-9514-municipios', municipalitiesCsv.csv, {
    fact_sheet: CENSUS_FACT_SHEET,
    table: ['SIDRA 9514'],
    variables: [
      '93 População residente',
      '2 Sexo',
      '287 Idade (grupos de 5 anos a partir de 15, 80 ou mais somados)',
    ],
    downloaded_on: today(),
    version: `Censo 2022, universo, ${municipalitiesCsv.total} municípios`,
  })
  write(
    'sidra-10185-municipios',
    municipalitiesToCsv(maritalMunicipalities),
    META_10185_MUNICIPALITIES(maritalMunicipalities.length),
  )
}

await (process.argv.includes('--municipalities-only')
  ? municipalitiesOnly()
  : main())
