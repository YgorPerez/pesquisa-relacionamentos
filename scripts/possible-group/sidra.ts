// The SIDRA tables through IBGE's aggregates API
// (https://servicodados.ibge.gov.br/api/docs/agregados?versao=3).

export interface SidraValue {
  /** Place code: `1` for Brazil, 2 digits for a state, 7 for a municipality. */
  readonly place: string
  readonly name: string
  /** The category code in each classification, in request order. */
  readonly categories: ReadonlyArray<string>
  readonly value: number
}

const API = 'https://servicodados.ibge.gov.br/api/v3/agregados'

export function sidraUrl(
  table: number,
  variable: number,
  places: string,
  classifications: ReadonlyArray<string>,
): string {
  return `${API}/${table}/periodos/2022/variaveis/${variable}?localidades=${places}&classificacao=${classifications.join('|')}`
}

/** Runs one query and returns one value per place × category combination. */
export async function fetchSidra(
  table: number,
  variable: number,
  places: string,
  classifications: ReadonlyArray<string>,
): Promise<SidraValue[]> {
  const url = sidraUrl(table, variable, places, classifications)
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url)
    if (response.ok) return readSidraResponse(await response.json())
    if (attempt >= 4)
      throw new Error(`SIDRA ${table} answered ${response.status}: ${url}`)
    await new Promise((r) => setTimeout(r, 2000 * attempt))
  }
}

interface SidraResponse {
  readonly resultados: ReadonlyArray<{
    readonly classificacoes: ReadonlyArray<{
      readonly categoria: Readonly<Record<string, string>>
    }>
    readonly series: ReadonlyArray<{
      readonly localidade: { readonly id: string; readonly nome: string }
      readonly serie: Readonly<Record<string, string>>
    }>
  }>
}

/** "-" is zero in SIDRA; "X" (confidential) and "..." (not available) stop the pipeline. */
export function readSidraResponse(json: unknown): SidraValue[] {
  const [variable] = json as ReadonlyArray<SidraResponse>
  if (!variable) throw new Error('SIDRA response without a variable')
  const values: SidraValue[] = []
  for (const result of variable.resultados) {
    const categories = result.classificacoes.map(
      (c) => Object.keys(c.categoria)[0] ?? '',
    )
    for (const s of result.series) {
      const text = s.serie['2022'] ?? ''
      const value = text === '-' ? 0 : Number(text)
      if (!Number.isFinite(value) || text === '')
        throw new Error(
          `value "${text}" in SIDRA for ${s.localidade.nome} ${categories.join('/')}`,
        )
      values.push({
        place: s.localidade.id,
        name: s.localidade.nome,
        categories,
        value,
      })
    }
  }
  return values
}
